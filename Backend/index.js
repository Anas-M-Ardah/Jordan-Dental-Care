import express, { json, query }  from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import cors from "cors"
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import session from "express-session";
import axios from "axios";
import ejs from "ejs";
import cloudinary from "cloudinary"
import multer from "multer";

env.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create multer instance
const upload = multer({ storage: storage }).single('image');

const db = new pg.Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

db.connect()
    .then(() => {
        console.log('Connected to the database');
        })
    .catch(err => {
        console.error('Error connecting to the database:', err);
});

const port = 3000;
// Used for hashing the passwords
const saltRounds = 10;

// change this later
const secretKey = process.env.SECRET;
const emailVerAPIKey = process.env.EMAIL_VERIFICATION_API_KEY;

const app = express();

app.use(cors());

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.set('view engine', 'ejs'); // Set EJS as the default template engine

app.set("views", "views");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS, // Your Gmail email address
        pass: process.env.EMAIL_PASSWORD // Your Gmail password
    }
});

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 1 day in milliseconds
        httpOnly: true
    }
}));

let isLoggedIn = false;

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {

    if (!isLoggedIn) {
        return res.status(401).send("Unauthorized"); // Send 401 Unauthorized status code with a message
    }
    next();
}

// ----------------------------------   Start -----------------------------------------------------

app.post("/dentist/login" ,async (req, res) => {
    const { emailOrPhoneNumber, password } = req.body;

    // Check if the emailOrPhoneNumber is an email or national ID
    let userQuery;
    if (emailOrPhoneNumber.includes('@')) {
        // If the emailOrNationalId contains '@', assume it's an email
        userQuery = "SELECT * FROM doctors WHERE email_address = $1";
    } else {
        // Otherwise, assume it's a national ID
        userQuery = "SELECT * FROM doctors WHERE phone_number = $1";
    }

    try {
        const result = await db.query(userQuery, [emailOrPhoneNumber]);
        if (result.rows.length === 0) {
            // User not found
            const userMessage = "Email or Phonenumber doesn't exist";
            return res.status(404).json({ error: userMessage });
        }

        // Verify the password
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // Incorrect password
            const userMessage = "Incorrect Password";
            return res.status(401).json({ error: userMessage });
        }


        // Authentication successful
        const username = "Dr. " + result.rows[0]["first_name"];
        isLoggedIn = true;
        const id = result.rows[0]["id"];
        const isApproved = result.rows[0]["isapproved"];
        const isBanned = result.rows[0]["isbanned"];
        // Upon successful login, store user information in the session
        return res.status(200).json({ message: "Login successful", username, id, isApproved, isBanned});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/dentist/profile", requireAuth ,async (req, res) => {
    const { emailOrPhoneNumber } = req.query;
    const query = "SELECT * FROM DOCTORS WHERE email_address = $1 OR phone_number = $1";
    try {
        const result = await db.query(query, [emailOrPhoneNumber]);
        return res.json(result.rows);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/dentist/get-services", requireAuth, async (req, res) => {
    const query = "SELECT NAME, ID FROM SERVICES"
    try{
        const result = await db.query(query);
        return res.json(result.rows);
    } catch (error){
        console.error("Error fetching services name:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/add-appointment", requireAuth, async (req, res) => {
    console.log("Adding or modifying appointment...");
    const { service, date, hour, minute } = req.body;
    const doctorId = req.query.doctorId; // Extract doctorId from query parameters

    if (!doctorId || isNaN(parseInt(doctorId))) {
        console.log("Invalid doctor ID");
        return res.status(400).json({ error: "Invalid doctor ID" });
    }

    if (!service) {
        console.log("Missing service");
        return res.status(400).json({ error: "Missing service" });
    }

    if (!date) {
        console.log("Missing date");
        return res.status(400).json({ error: "Missing date" });
    }

    if (!hour || !minute) {
        console.log("Missing time");
        return res.status(400).json({ error: "Missing time" });
    }

    try {
        console.log("Checking if the doctor offers this service...");
        // Check if the doctor offers this service from the doctor_services table
        const serviceOffered = await db.query("SELECT * FROM doctor_services WHERE doctor_id = $1 AND service_id = $2", [doctorId, service]);
        console.log("serviceOffered:", serviceOffered.rows);

        if (!serviceOffered.rows.length) {
            console.log("Doctor does not offer this service");
            return res.status(401).json({ message: "Doctor does not offer this service" });
        }

        // Construct appointment date and time
        const appointmentDateTime = new Date(date);
        appointmentDateTime.setHours(hour, minute);

        // Check if the appointment already exists
        const existingAppointment = await db.query("SELECT * FROM appointments WHERE doctor_id = $1 AND service_id = $2 AND appointment_datetime = $3", [doctorId, service, appointmentDateTime]);
        
        if (existingAppointment.rows.length) {
            // If the appointment exists, update it
            await db.query("UPDATE appointments SET status = 'Available' WHERE doctor_id = $1 AND service_id = $2 AND appointment_datetime = $3", [doctorId, service, appointmentDateTime]);
            console.log("Appointment modified successfully");
            return res.status(200).json({ message: "Appointment modified successfully" });
        } else {
            // If the appointment does not exist, insert a new one
            await db.query("INSERT INTO appointments (doctor_id, service_id, appointment_datetime, status) VALUES ($1, $2, $3, 'Available')", [doctorId, service, appointmentDateTime]);
            console.log("Appointment added successfully");
            return res.status(200).json({ message: "Appointment added successfully" });
        }
    } catch (error) {
        console.error("Error adding or modifying appointment:", error);
        return res.status(500).send("Error adding or modifying appointment");
    }
});

app.post("/add-multiple-appointments", requireAuth, async (req, res) => {
    const { service, date, startTime, endTime, timeBetweenEachAppointment } = req.body;
    const doctorId = req.query.doctorId;

   
    if (!doctorId || isNaN(parseInt(doctorId))) {
        console.log("Invalid doctor ID");
        return res.status(400).json({ error: "Invalid doctor ID" });
    }

    if (!service) {
        console.log("Missing service");
        return res.status(400).json({ error: "Missing service" });
    }

    if (!date) {
        console.log("Missing date");
        return res.status(400).json({ error: "Missing date" });
    }

    if (!startTime || !endTime) {
        console.log("Missing time");
        return res.status(400).json({ error: "Missing time" });
    }

    try {
        console.log("Checking if the doctor offers this service...");
        // Check if the doctor offers this service from the doctor_services table
        const serviceOffered = await db.query("SELECT * FROM doctor_services WHERE doctor_id = $1 AND service_id = $2", [doctorId, service]);
        console.log("Service offered:", serviceOffered.rows);

        if (!serviceOffered.rows.length) {
            console.log("Doctor does not offer this service");
            return res.status(401).json({ message: "Doctor does not offer this service" });
        }

        // Construct appointment date and time
        const startDateTime = new Date(date + " " + startTime);
        const endDateTime = new Date(date + " " + endTime);

        // Insert each appointment into the database
        while (startDateTime < endDateTime) {
            // Check if the appointment already exists
            const existingAppointment = await db.query("SELECT * FROM appointments WHERE doctor_id = $1 AND service_id = $2 AND appointment_datetime = $3", [doctorId, service, startDateTime]);

            if (existingAppointment.rows.length) {
                // If the appointment exists, update it
                await db.query("UPDATE appointments SET status = 'Available' WHERE doctor_id = $1 AND service_id = $2 AND appointment_datetime = $3", [doctorId, service, startDateTime]);
                console.log("Appointment modified successfully");
            } else {
                // If the appointment does not exist, insert a new one
                await db.query("INSERT INTO appointments (doctor_id, service_id, appointment_datetime, status) VALUES ($1, $2, $3, 'Available')", [doctorId, service, startDateTime]);
                console.log("Appointment added successfully");
            }

            // Increment appointment time based on the time between each appointment
            startDateTime.setTime(startDateTime.getTime() + (timeBetweenEachAppointment * 60000)); // Convert minutes to milliseconds
        }

        console.log('Done');

        return res.status(200).json({ message: "Appointments added or modified successfully" });
    } catch (error) {
        console.error("Error adding or modifying appointments:", error);
        return res.status(500).send("Error adding or modifying appointments");
    }
});

  


app.post("/add-service", requireAuth, async (req, res) => {
    console.log("Adding or modifying service...");
    const { id, price, duration } = req.body;
    const doctorId = req.query.doctorId; // Extract doctorId from query parameters
    let message = "";

    if (!doctorId || isNaN(parseInt(doctorId))) {
        console.log("Invalid doctor ID");
        return res.status(400).json({ error: "Invalid doctor ID" });
    }

    if (!id) {
        console.log("Missing name");
        return res.status(400).json({ error: "Missing name" });
    }

    if (!price || isNaN(parseFloat(price))) {
        console.log("Invalid price");
        return res.status(400).json({ error: "Invalid price" });
    }

    if (!duration || isNaN(parseInt(duration))) {
        console.log("Invalid duration");
        return res.status(400).json({ error: "Invalid duration" });
    }

    try {
        // Check if the price is within the acceptable range
        const result = await db.query("SELECT min_price, max_price FROM services WHERE id = $1", [id]);
        const prices = result.rows[0];

        if (price < Number(prices.min_price) || price > Number(prices.max_price)) {
            const message = `Price is not within the range. Range ${prices.min_price} - ${prices.max_price}`;
            return res.status(400).json({ error: message });
        }

        // check if dentist already offers the service
        const check = await db.query('SELECT * FROM DOCTOR_SERVICES WHERE doctor_id = $1 AND service_id = $2', [doctorId, id]);

        if(check.rows.length > 0){
            console.log('ID exists in the table');
            const query = "UPDATE DOCTOR_SERVICES SET  price = $1, duration_minutes = $2 WHERE doctor_id = $3 AND service_id = $4";
            await db.query(query, [price, duration, doctorId, id]);
            message = "Service updated!";
        } else {
            console.log('ID does not exist in the table');
             // add the input to the database
              const query = "INSERT INTO DOCTOR_SERVICES (doctor_id, service_id, price, duration_minutes) VALUES ($1, $2, $3, $4)";
              await db.query(query, [doctorId ,id, price, duration]);
              message = "Service added!"
          }

        res.status(200).json({ message: message });
    } catch (error) {
        console.error("Error adding or modifying service:", error);
        return res.status(500).json({ error: "Error adding or modifying service" });
    }
});

app.get("/dentist/view-history", requireAuth, async (req, res) => {
    try {
        let appointments = [];
        const doctor_id = req.query.id;

        // Dentist
        
        const query = `
        SELECT a.*, 
            d.FIRST_NAME AS doctor_first_name, 
            d.LAST_NAME AS doctor_last_name, 
            u.FIRSTNAME AS patient_first_name, 
            u.LASTNAME AS patient_last_name, 
            a.HAS_TREATMENT_PLAN
            FROM APPOINTMENTS a 
            JOIN DOCTORS d ON a.DOCTOR_ID = d.id 
            JOIN USERS u ON a.USER_ID = u.id 
            WHERE a.DOCTOR_ID = $1 
            AND a.status = 'Done'
            AND a.APPOINTMENT_DATETIME <= CURRENT_DATE
            ORDER BY a.APPOINTMENT_DATETIME DESC;
        `;

        appointments = await db.query(query, [doctor_id]);

        res.status(200).json(appointments.rows);
    } catch (error) {
        console.error("Error getting appointment history:", error);
        res.status(500).json({ error: "An error occurred." });
    }
});


app.post("/patient/login" ,async (req, res) => {
    const { emailOrPhoneNumber, password } = req.body;

    // Check if the emailOrPhoneNumber is an email or national ID
    let userQuery;
    if (emailOrPhoneNumber.includes('@')) {
        // If the emailOrNationalId contains '@', assume it's an email
        userQuery = "SELECT * FROM users WHERE email = $1";
    } else {
        // Otherwise, assume it's a national ID
        userQuery = "SELECT * FROM users WHERE phone_number = $1";
    }

    try {
        const result = await db.query(userQuery, [emailOrPhoneNumber]);
        if (result.rows.length === 0) {
            // User not found
            const userMessage = "Email or Phonenumber doesn't exist";
            return res.status(404).json({ error: userMessage });
        }

        // Verify the password
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // Incorrect password
            const userMessage = "Incorrect Password";
            return res.status(401).json({ error: userMessage });
        }

        // Authentication successful
        const username =  result.rows[0]["firstname"];
        const id = result.rows[0]["id"];
        const isVerified = result.rows[0]["isverified"];
        const email = result.rows[0]["email"];
        const isBanned = result.rows[0]["isbanned"];
        isLoggedIn = true;
        // Upon successful login, store user information in the session
        return res.status(200).json({ message: "Login successful", username, id, isVerified, email, isBanned});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/patient/profile", requireAuth ,async (req, res) => {
    const { emailOrPhoneNumber } = req.query;
    const query = "SELECT * FROM USERS WHERE email = $1 OR phone = $1";
    try {
        const result = await db.query(query, [emailOrPhoneNumber]);
        return res.json(result.rows);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/patient/view-history", requireAuth, async (req, res) => {
    try {
        let appointments = [];
        const patient_id = req.query.id;

        const query = `
        SELECT a.*, 
            d.FIRST_NAME AS doctor_first_name, 
            d.LAST_NAME AS doctor_last_name, 
            u.FIRSTNAME AS patient_first_name, 
            u.LASTNAME AS patient_last_name 
            FROM APPOINTMENTS a 
            JOIN DOCTORS d ON a.DOCTOR_ID = d.id 
            JOIN USERS u ON a.USER_ID = u.id 
            WHERE a.USER_ID = $1 
            AND a.status = 'Done'
            AND a.APPOINTMENT_DATETIME <= CURRENT_DATE
            ORDER BY a.APPOINTMENT_DATETIME DESC;
        `;

        appointments = await db.query(query, [patient_id]);
        res.json({ appointments: appointments.rows });
    } catch (error) {
        console.error("Error getting appointment history:", error);
        res.status(500).json({ error: "An error occurred." });
    }
});


app.post("/patient/signup", async (req, res) => {
    const { first_name, last_name, email, phone, national_id, dob, password } = req.body;


    try {
        
        const check = await userExists(email, national_id, phone);

        console.log(check);
        
        if(check.length > 0){
            let userMessage;
            if(phone === check[0].phone){
                userMessage = "Phone Number already exists. Try logging in.";
            } else if(email === check[0].email){
                userMessage = "Email already exists. Try logging in.";
            } else if (nationalId === check[0].nationalId){
                userMessage = "National Id already exists. Try logging in.";
            } else {
                userMessage = "Account already exists. Try logging in.";
            }
            return res.status(409).json({ error: userMessage });
        }

        const hash = await hashPassword(password);
        await db.query(
            "INSERT INTO users (firstname, lastname, email, national_id, phone, password, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [first_name, last_name, email, national_id, phone, hash, dob]
        );
        console.log("User inserted successfully");
        const message = await sendEmailVerification(email);
        return res.status(200).json({ message: message });        
    }  catch (err) {
        console.error("Error:", err);
        return res.sendStatus(500);
    }
});

app.get("/patient/verification/:id/:token", async (req, res, next) => {
    const { id, token } = req.params;

    try {
        // Construct secret using the user's password (replace with appropriate secret later)
        console.log(process.env.SECERT);
        const secret = secretKey;
        console.log(secret);
        // Verify the token
        const payload = jwt.verify(token, secret);

        const query = "UPDATE users SET isVerified = true WHERE email = $1";
        await db.query(query, [id]);
        
        res.status(200).send("Your email is verified now");
    } catch (err) {
        // Handle invalid token or other errors
        console.error('Error verifying email:', err);
        res.status(400).send('Invalid or expired token');
    }
});

app.post("/patient/send-verification", async (req, res) => {
    await sendEmailVerification(req.query.email);
    return res.status(200).json({ message: "Verification email sent" });
});

app.post("/patient/forgot-password", async (req, res) => {
    
    const { emailOrPhoneNumber } = req.body;

    const check = await userExists(emailOrPhoneNumber);

    // if check is not empty, send email
    if(check.length > 0){
        const message = await sendPasswordReset(emailOrPhoneNumber);
        return res.status(200).json({ message: message });
    } else {
        return res.status(404).json({ message: "User not found" });
    }

});

app.get("/patient/reset-password/:id/:token", async (req, res, next) => {
    const { id, token } = req.params;

    try {
        // Construct secret using the user's password (replace with appropriate secret later)
        const secret = secretKey;
        // Verify the token
        const payload = jwt.verify(token, secret);

        // Render the reset password form with the user's email
        res.render('reset-password', { email: id, message: "" });
    } catch (err) {
        // Handle invalid token or other errors
        console.error('Error resetting password:', err);
        res.status(400).send('Invalid or expired token');
    }
});

app.post("/patient/reset-password/:id/:token", async (req, res, next) => {
    const { id, token } = req.params;
    const { password, password2 } = req.body;

    let userMessage = "";

    try {
        // Check if the user exists in the database
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = userResult.rows[0];

        // Construct secret using the user's password (replace with appropriate secret later)
        const secret = secretKey;

        // Verify the token
        const payload = jwt.verify(token, secret);

        // Validate the new password
        if (!isStrongPassword(password)) {
            userMessage = 'Your password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.';
            return res.render('reset-password', { email: user.email, message: userMessage });
        }

        // Validate that password and password2 match
        if (!passwordsMatch(password, password2)) {
            userMessage = "The passwords don't match";
            return res.render('reset-password', { email: user.email, message: userMessage });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);

        // Update the user's password in the database
        await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, id]);

        // Password reset successful
        return res.send('Password reset successful');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).send(error.message);
    }
});

app.get("/services", async (req, res) => {
    try {
        const query = "SELECT * FROM SERVICES";
        const result = await db.query(query); // Await the result of the query
        res.status(200).json({ services: result.rows });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get("/dentists", async (req, res) => {
    try {
        const service_id = Number(req.query.service_id);
        
        // SQL query to retrieve doctors offering the specified service with their prices
        const query = `
            SELECT d.*, ds.price
            FROM doctors d
            JOIN doctor_services ds ON d.id = ds.doctor_id
            JOIN services s ON ds.service_id = s.id
            WHERE s.id = $1;
        `;

        // Get number of appointments for each doctor
        const countQuery = `
            SELECT d.id, COUNT(*) as appointment_count
            FROM doctors d
            JOIN appointments a ON d.id = a.doctor_id
            WHERE a.service_id = $1 
            AND a.STATUS = 'Available' 
            AND a.APPOINTMENT_DATETIME > NOW() 
            GROUP BY d.id;
        `;
        const { rows: appointmentCounts } = await db.query(countQuery, [service_id]);

        const { rows: dentists } = await db.query(query, [service_id]);
        
        // Join appointmentCounts with dentists based on id
        const dentistsWithAppointments = dentists.map(dentist => {
            const appointmentCount = appointmentCounts.find(count => count.id === dentist.id);
            return {
                ...dentist,
                appointment_count: appointmentCount ? appointmentCount.appointment_count : 0
            };
        });
        
        res.status(200).json({ dentists: dentistsWithAppointments });
    } catch (error) {
        console.error("Error retrieving dentists:", error);
        res.status(500).json({ error: error.message });
    }
});




app.get("/appointments", async (req, res) => {
   
    try{
        const dentist_id = Number(req.query.dentist_id);
        const service_id = Number(req.query.service_id);
        const query = "SELECT * FROM appointments WHERE doctor_id = $1 AND service_id = $2 AND STATUS = 'Available' AND APPOINTMENT_DATETIME > NOW() ";
        const { rows } = await db.query(query, [dentist_id, service_id]);
        res.status(200).json({appointments: rows});
    } catch (error) {
        console.error("Error retrieving appointments:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/appointments", async (req, res) => {
    
    try{
        const id = Number(req.query.id);
        const user_id = Number(req.query.user_id);
        const query = await db.query("UPDATE APPOINTMENTS SET USER_ID = $1, STATUS = 'PENDING' WHERE APPOINTMENT_ID = $2", [user_id, id]);
        res.status(200).json({message: "Appointment Booked Successfully"});
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/myAppointments", async (req, res) => {
   
    const isDentist = req.query.dentist;
    const id = Number(req.query.id);

    if(isDentist === "false"){
        try{
            const query = "SELECT a.*, d.FIRST_NAME AS doctor_first_name, d.LAST_NAME AS doctor_last_name, u.FIRSTNAME AS patient_first_name, u.LASTNAME AS patient_last_name FROM APPOINTMENTS a JOIN DOCTORS d ON a.DOCTOR_ID = d.id JOIN USERS u ON a.USER_ID = u.id WHERE a.USER_ID = $1;"
            const { rows } = await db.query(query, [id]);
            res.status(200).json({appointments: rows});
        } catch (error) {
            console.error("Error retrieving appointments:", error);
            res.status(500).json({ error: error.message });
        }
    } else {

        try{
            const query = "SELECT a.*, d.FIRST_NAME AS doctor_first_name, d.LAST_NAME AS doctor_last_name, u.FIRSTNAME AS patient_first_name, u.LASTNAME AS patient_last_name FROM APPOINTMENTS a JOIN DOCTORS d ON a.DOCTOR_ID = d.id JOIN USERS u ON a.USER_ID = u.id WHERE a.DOCTOR_ID = $1;";
            const appointments = await db.query(query, [id]);
            res.status(200).json({appointments: appointments.rows});   
        } catch (error) {
            console.error("Error retrieving appointments:", error);
            res.status(500).json({ error: error.message });
        }
    }
});

app.post("/acceptAppointment/:id", async (req, res) => {
   
    const id = Number(req.params.id);

    try{
        const query = await db.query("UPDATE APPOINTMENTS SET STATUS = 'confirmed' WHERE APPOINTMENT_ID = $1", [id]);
        res.status(200).json({message: "Appointment Accepted Successfully"});
    } catch (error) {
        console.error("Error accepting appointment:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/declineAppointment/:id", async (req, res) => {

    const id = Number(req.params.id);

    try{
        const query = await db.query("UPDATE APPOINTMENTS SET STATUS = 'Declined' WHERE APPOINTMENT_ID = $1", [id]);
        res.status(200).json({message: "Appointment Declined Successfully"});
    } catch (error) {
        console.error("Error declining appointment:", error);
        res.status(500).json({ error: error.message });
    }

});

app.post("/deleteAppointment/:id", async (req, res) => {
   
    const id = Number(req.params.id);

    try{
        const query = await db.query("DELETE FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1", [id]);
        res.status(200).json({message: "Appointment Deleted Successfully"});
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: error.message });
    }

});

app.post("/sendAppointment/:id", async (req, res) => {
    
    const id = Number(req.params.id);

    try{
        // Set status to done
        const query = await db.query("UPDATE APPOINTMENTS SET STATUS = 'Done' WHERE APPOINTMENT_ID = $1", [id]);
        res.status(200).json({message: "Appointment Sent Successfully"});
    } catch (error) {
        console.error("Error sending appointment:", error);
        res.status(500).json({ error: error.message });
    }

});

app.post("/cancelAppointment/:id", async (req, res) => {

    const id = Number(req.params.id);

    try{
        // Set status to cancelled
        const query = await db.query("UPDATE APPOINTMENTS SET STATUS = 'AVAILABLE' WHERE APPOINTMENT_ID = $1", [id]);
        res.status(200).json({message: "Appointment Cancelled Successfully"});
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).json({ error: error.message });
    }
})

app.get("/viewFeedback/:id", async (req, res) => {
   
    const query = `SELECT FEEDBACK, RATING FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`;
    try {
        const result = await db.query(query, [req.params.id]);
        let feedback, rating;
        
        if (result.rowCount > 0) {
            feedback = result.rows[0].feedback;
            rating = result.rows[0].rating;
        }
        
        // if feedback is empty send something appropriate
        if (feedback === undefined || feedback === null) {
            feedback = "Patient has not given feedback yet";
        }

        // same for rating
        if (rating === undefined || rating === null) {
            rating = "Patient has not given a rating yet";
        }

        res.status(200).json({feedback: feedback, rating: rating});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});

app.post("/give-feedback", async (req, res) => {
  
    const { appointmentId, rating, feedback } = req.body;
    
    try{
        const query = "UPDATE APPOINTMENTS SET FEEDBACK = $1, RATING = $2 WHERE APPOINTMENT_ID = $3";
        const result = await db.query(query, [feedback, rating, appointmentId]);
        console.log("Feedback given successfully");
        res.status(200).json({message: "Feedback given successfully"});
    } catch(error){
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});


app.post("/give-treatment-plan/:id", requireAuth, async (req, res) => {
    
    // get patient id from appointment_id 
    let query = `SELECT USER_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`; // SQL query

    try {
        const result = await db.query(query, [req.params.id]); // execute query and get results

        if (!result.rows || result.rows.length === 0) { // if no patient found return 404
            throw new Error("Patient not found");
        }

        const {medical_history, dental_issues, estimated_cost, comments, treatment_plan } = req.body;

        let patient_id = result.rows[0].user_id;

        // write a query to get the patient name
        query = `SELECT * FROM USERS WHERE ID = $1`; // SQL query
        
        const result2 = await db.query(query, [patient_id]); // execute query and get results

        const patient_name = result2.rows[0].firstname + " " + result2.rows[0].lastname;

        // get today's date

        const date = new Date();

        // if result2 is not empty then the patient already have a treatment plan then update instead of insert
        if (result.rowCount > 0) {
            query = `UPDATE TREATMENT_PLAN SET PATIENT_NAME = $1, DATE = $2, MEDICAL_HISTORY = $3, DENTAL_ISSUES = $4, ESTIMATED_COST = $5, ADDITIONAL_COMMENTS = $6, PROPOSED_TREATMENT_PLAN = $7, PATIENT_ID = $8 WHERE APPOINTMENT_ID = $9`; // SQL query
        } else {
            query = `INSERT INTO TREATMENT_PLAN (PATIENT_NAME, DATE, MEDICAL_HISTORY, DENTAL_ISSUES, ESTIMATED_COST, ADDITIONAL_COMMENTS, PROPOSED_TREATMENT_PLAN, PATIENT_ID, APPOINTMENT_ID) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`; // SQL query
        }

        let query2 = 'UPDATE APPOINTMENTS SET HAS_TREATMENT_PLAN = TRUE WHERE APPOINTMENT_ID = $1';
        await db.query(query2, [req.params.id]);

        patient_id = result.rows[0].user_id;

        await db.query(query, [patient_name, date, medical_history, dental_issues, estimated_cost, comments, treatment_plan, patient_id, req.params.id]); // execute query
        res.status(200).json({message: "Treatment plan given successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }

});


app.post("/upload-image/:id", requireAuth, async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                // Handle upload error
                console.error('Upload error:', err);
                return res.status(500).send("Upload error");
            }

            const path = req.file.path;

            // Upload the file to Cloudinary
            const cloudinaryResult = await cloudinary.uploader.upload(path);
            const imageUrl = cloudinaryResult.secure_url;

            console.log(imageUrl);

            // Update or insert into the TREATMENT_PLAN table
            let query = `SELECT USER_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`;
            const appointmentResult = await db.query(query, [appointmentId]);

            if (!appointmentResult.rows || appointmentResult.rows.length === 0) {
                throw new Error("Patient not found");
            }

            // check if the patient already has a treatment plan
            const patient_id = appointmentResult.rows[0].user_id
            query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1 AND APPOINTMENT_ID = $2`;
            const treatmentPlanResult = await db.query(query, [patient_id, appointmentId]);

            // get today's date
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10);
            
            let updateQuery, queryParams;
            if (treatmentPlanResult.rowCount > 0) {
                updateQuery = `UPDATE TREATMENT_PLAN SET IMAGE_URL = $1, DATE = $2 WHERE APPOINTMENT_ID = $3`;
                queryParams = [imageUrl, formattedDate , appointmentId];
            } else {
                updateQuery = `INSERT INTO TREATMENT_PLAN (APPOINTMENT_ID, IMAGE_URL, PATIENT_ID, DATE) VALUES ($1, $2, $3, $4)`;
                queryParams = [appointmentId, imageUrl, patient_id, formattedDate];
            }

            await db.query(updateQuery, queryParams);

            console.log("Image uploaded and treatment plan updated successfully");
            res.status(200).json({message: "Image uploaded and treatment plan updated successfully"});
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/upload-image-1/:id", requireAuth, async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                // Handle upload error
                console.error('Upload error:', err);
                return res.status(500).send("Upload error");
            }

            const path = req.file.path;

            // Upload the file to Cloudinary
            const cloudinaryResult = await cloudinary.uploader.upload(path);
            const imageUrl = cloudinaryResult.secure_url;

            // Update or insert into the TREATMENT_PLAN table
            let query = `SELECT USER_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`;
            const appointmentResult = await db.query(query, [appointmentId]);

            if (!appointmentResult.rows || appointmentResult.rows.length === 0) {
                throw new Error("Patient not found");
            }

            // check if the patient already has a treatment plan
            const patient_id = appointmentResult.rows[0].user_id
            query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1 AND APPOINTMENT_ID = $2`;
            const treatmentPlanResult = await db.query(query, [patient_id, appointmentId]);

            // get today's date
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10);
            
            let updateQuery, queryParams;
            if (treatmentPlanResult.rowCount > 0) {
                updateQuery = `UPDATE TREATMENT_PLAN SET IMAGE_URL_1 = $1, DATE = $2 WHERE APPOINTMENT_ID = $3`;
                queryParams = [imageUrl, formattedDate , appointmentId];
            } else {
                updateQuery = `INSERT INTO TREATMENT_PLAN (APPOINTMENT_ID, IMAGE_URL_1, PATIENT_ID, DATE) VALUES ($1, $2, $3, $4)`;
                queryParams = [appointmentId, imageUrl, patient_id, formattedDate];
            }

            await db.query(updateQuery, queryParams);

            console.log("Image uploaded and treatment plan updated successfully");
            res.status(200).json({message: "Image uploaded and treatment plan updated successfully"});
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/upload-image-2/:id", requireAuth, async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                // Handle upload error
                console.error('Upload error:', err);
                return res.status(500).send("Upload error");
            }

            const path = req.file.path;

            // Upload the file to Cloudinary
            const cloudinaryResult = await cloudinary.uploader.upload(path);
            const imageUrl = cloudinaryResult.secure_url;

            // Update or insert into the TREATMENT_PLAN table
            let query = `SELECT USER_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`;
            const appointmentResult = await db.query(query, [appointmentId]);

            if (!appointmentResult.rows || appointmentResult.rows.length === 0) {
                throw new Error("Patient not found");
            }

            // check if the patient already has a treatment plan
            const patient_id = appointmentResult.rows[0].user_id
            query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1 AND APPOINTMENT_ID = $2`;
            const treatmentPlanResult = await db.query(query, [patient_id, appointmentId]);

            // get today's date
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10);
            
            let updateQuery, queryParams;
            if (treatmentPlanResult.rowCount > 0) {
                updateQuery = `UPDATE TREATMENT_PLAN SET IMAGE_URL_2 = $1, DATE = $2 WHERE APPOINTMENT_ID = $3`;
                queryParams = [imageUrl, formattedDate , appointmentId];
            } else {
                updateQuery = `INSERT INTO TREATMENT_PLAN (APPOINTMENT_ID, IMAGE_URL_2, PATIENT_ID, DATE) VALUES ($1, $2, $3, $4)`;
                queryParams = [appointmentId, imageUrl, patient_id, formattedDate];
            }

            await db.query(updateQuery, queryParams);

            console.log("Image uploaded and treatment plan updated successfully");
            res.status(200).json({message: "Image uploaded and treatment plan updated successfully"});
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/upload-image-3/:id", requireAuth, async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                // Handle upload error
                console.error('Upload error:', err);
                return res.status(500).send("Upload error");
            }

            const path = req.file.path;

            // Upload the file to Cloudinary
            const cloudinaryResult = await cloudinary.uploader.upload(path);
            const imageUrl = cloudinaryResult.secure_url;

            // Update or insert into the TREATMENT_PLAN table
            let query = `SELECT USER_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = $1`;
            const appointmentResult = await db.query(query, [appointmentId]);

            if (!appointmentResult.rows || appointmentResult.rows.length === 0) {
                throw new Error("Patient not found");
            }

            // check if the patient already has a treatment plan
            const patient_id = appointmentResult.rows[0].user_id
            query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1 AND APPOINTMENT_ID = $2`;
            const treatmentPlanResult = await db.query(query, [patient_id, appointmentId]);

            // get today's date
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10);
            
            let updateQuery, queryParams;
            if (treatmentPlanResult.rowCount > 0) {
                updateQuery = `UPDATE TREATMENT_PLAN SET IMAGE_URL_3 = $1, DATE = $2 WHERE APPOINTMENT_ID = $3`;
                queryParams = [imageUrl, formattedDate , appointmentId];
            } else {
                updateQuery = `INSERT INTO TREATMENT_PLAN (APPOINTMENT_ID, IMAGE_URL_3, PATIENT_ID, DATE) VALUES ($1, $2, $3, $4)`;
                queryParams = [appointmentId, imageUrl, patient_id, formattedDate];
            }

            await db.query(updateQuery, queryParams);

            console.log("Image uploaded and treatment plan updated successfully");
            res.status(200).json({message: "Image uploaded and treatment plan updated successfully"});
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});


app.get("/view-treatment-plan/:id", requireAuth, async (req, res) => {
   
    const id = req.params.id;

    try{
        const query = `SELECT * FROM TREATMENT_PLAN WHERE APPOINTMENT_ID = $1`;
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
    } catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    } 

});

app.get("/todaysAppointments/:id", requireAuth, async (req, res) => {
    const dentist_id = req.params.id;

    try {
        // Select user_id and appointment_datetime from appointments where appointment_datetime = CURRENT_DATE and Status = confirmed
        const query = `
            SELECT a.user_id, a.appointment_datetime
            FROM appointments a
            WHERE a.doctor_id = $1 
            AND a.appointment_datetime::date = CURRENT_DATE 
            AND (a.status = 'confirmed' OR a.status = 'Done')
        `;
        const appointmentsResult = await db.query(query, [dentist_id]);

        // Extract user IDs from the result
        const userIds = appointmentsResult.rows.map(row => row.user_id);

        if (userIds.length === 0) {
            // No appointments found for the dentist on the current date
            return res.status(200).json({ message: "No appointments found for today." });
        }

        // Get patient names from users table using the user IDs from the previous query
        const userDetailsQuery = `
            SELECT id, firstname, lastname
            FROM users
            WHERE id IN (${userIds.join(',')})
        `;
        const userDetailsResult = await db.query(userDetailsQuery);

        // Map user IDs to patient names for easier lookup
        // Map user IDs to patient details (first name and last name)
        const userDetailsMap = userDetailsResult.rows.reduce((map, row) => {
            const fullName = `${row.firstname} ${row.lastname}`;
            map[row.id] = fullName;
            return map;
        }, {});


        // Combine appointment data with patient names
        const appointments = appointmentsResult.rows.map(row => ({
            patient_name: userDetailsMap[row.user_id],
            appointment_datetime: row.appointment_datetime
        }));

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/myPatients/:id", requireAuth, async (req, res) => {
    const dentist_id = req.params.id;

    try {
        // Query to get USER_IDs of patients with confirmed or done appointments
        const appointmentQuery = `
            SELECT DISTINCT ON (USER_ID) USER_ID, APPOINTMENT_DATETIME 
            FROM APPOINTMENTS 
            WHERE DOCTOR_ID = $1 
            AND STATUS IN ('Confirmed', 'Done')
            ORDER BY USER_ID, APPOINTMENT_DATETIME DESC;
        `;
        const appointmentResult = await db.query(appointmentQuery, [dentist_id]);

        // Extract the last appointment for each patient
        const lastAppointments = appointmentResult.rows;

        // Query to get information of patients from users table
        const usersQuery = `
            SELECT id, firstname, lastname, phone, date_of_birth 
            FROM users 
            WHERE id IN (${lastAppointments.map(row => row.user_id).join(', ')});
        `;
        const usersResult = await db.query(usersQuery);
   
        res.status(200).json({ "patient_info": usersResult.rows, "last_appointments": lastAppointments });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/treatment-plan/:id", requireAuth, async (req, res) => {
    
    const patient_id = req.params.id;
    
    try{
        const query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1`;
        const result = await db.query(query, [patient_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }

});

app.post("/dentist/signup", async (req, res) => {
       
    let {firstName, lastName, dob, nationalId, email, phoneNumber, location, experience, certificateUrl, imageUrl, 
        password, confirmPassword, gender} = req.body;

    if(imageUrl === ""){
        imageUrl = "https://i.ibb.co/tHd6Wdj/default-profile-pic.jpg";
    }

    // check if doctor already exists
    if(await doctorExists(email, nationalId, phoneNumber)){
        return res.status(400).send("Doctor already exists");
    }

    // get current date
    const date_joined = new Date();

    try{
        const hashedPassword = await hashPassword(password);
        const query = "INSERT INTO doctors (first_name, last_name, date_of_birth, national_id, email_address, phone_number, location, experience, certificate_url, image_url, password, gender, date_joined, isApproved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ";
        const result = await db.query(query, [firstName, lastName, dob, nationalId, email, phoneNumber, location, experience, certificateUrl, imageUrl, hashedPassword, gender, date_joined, false]);
        res.status(200).send("Dentist signed up successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }

});

app.get("/patientHistory/:patientId", requireAuth, async (req, res) => {
   
    const patientId = req.params.patientId;

    try{

        const query = `SELECT * FROM TREATMENT_PLAN WHERE PATIENT_ID = $1 AND DATE <= CURRENT_DATE ORDER BY DATE DESC`;
        const result = await db.query(query, [patientId]);

        // check if result is empty
        if(result.rows.length === 0){
            return res.status(404).send("No treatment plan found");
        } else{
            res.status(200).json(result.rows);
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }

});

app.post("/absentAppointment/:appointmentId", requireAuth, async (req, res) => {
    
    const appointmentId = req.params.appointmentId;

    try{
        const query = `UPDATE APPOINTMENTS SET STATUS = 'Absent' WHERE APPOINTMENT_ID = $1`;
        const result = await db.query(query, [appointmentId]);
        res.status(200).send("Absent appointment updated successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/patient/request-appointment", requireAuth, async (req, res) => {
 
    const {appointmentDate, serviceName, patientName, phoneNumber, email, painEffects, dentistId} = req.body;

    const date = new Date(appointmentDate);
    const formattedDate = date.toISOString().split("T")[0];
    const time = date.toTimeString().split(" ")[0];

    // get dentist email

    try{
        const query = `SELECT EMAIL_ADDRESS FROM DOCTORS WHERE ID = $1`;
        const result = await db.query(query, [dentistId]);

        const dentistEmail = result.rows[0].email_address;

        // send email to dentist
        const payload = {
            email: dentistEmail,
        }

        const mailOptions = {
            from: process.env.EMAIL_ADDRESS, // Sender address
            to: dentistEmail,
            subject: "Appointment Request", // Email subject
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #4CAF50;">Appointment Request</h2>
                    <p><strong>Patient Name:</strong> ${patientName}</p>
                    <p><strong>Requested Appointment Date and Time:</strong> ${formattedDate} at ${time}</p>
                    <p><strong>Requested Service:</strong> ${serviceName}</p>
                    <p><strong>Patient Phone Number:</strong> ${phoneNumber}</p>
                    <p><strong>Patient Email:</strong> ${email}</p>
                    <p><strong>Pain/Effects they are feeling:</strong> ${painEffects}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.9em; color: #555;">This is an automated message. Please do not reply to this email.</p>
                </div>
            ` // Email body with improved format
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        // return json message
        res.status(200).json({message: "Email sent successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// --------------------------------------------------- Helper functions ----------------------------------------------------

// Function to check if user already exists in the database
async function userExists(email, nationalId = "", phone = "") {
    const checkResult = await db.query(
        "SELECT * FROM users WHERE email = $1 OR national_id = $2 OR phone = $3",
        [email, nationalId, phone]
    );
    return checkResult.rows;
}

// Function to check if doctor already exists in the database
async function doctorExists(email, nationalId = "", phone = "") {
    const checkResult = await db.query(
        "SELECT * FROM doctors WHERE email_address = $1 OR national_id = $2 OR phone_number = $3",
        [email, nationalId, phone]
    );

    return checkResult.rows.length > 0;
}

// Function to hash password
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

async function sendEmailVerification(email) {
    // User exists, create a one-time link valid for 15 minutes
    const secret = secretKey; // Use the same secretKey for signing
    const payload = {
        email: email,
    }

    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const link = `http://localhost:3000/patient/verification/${email}/${token}`;

    // Define email content
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // Sender address
        to: email, // Recipient address
        subject: "Verify Email", // Email subject
        html: `
            <p>Please click the following link to verify your email:</p>
            <a href="${link}">Verify Email</a>
        ` // Email body with password reset link
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Email verification sent to:", email);
        return "Verification email sent";
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return "An error occurred while sending the verification email";
    }
}

async function sendPasswordReset(email) {
    // User exists, create a one-time link valid for 15 minutes
    const secret = secretKey; // Use the same secretKey for signing
    const payload = {
        email: email,
    }

    const token = jwt.sign(payload, secret, { expiresIn: '15m' });

    // Define email content
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // Sender address
        to: email, // Recipient address
        subject: "Reset Password", // Email subject
        html: `
            <p>Please click the following link to reset your password:</p>
            <a href="http://localhost:3000/patient/reset-password/${email}/${token}">Reset Password</a>
        ` // Email body with password reset link
    };
    
    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent to:", email);
        return "Password reset email sent";
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        return "An error occurred while sending the password reset email";
    }
}

function passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

// Function to check if password meets strong criteria
function isStrongPassword(password) {
    // Minimum length requirement
    if (password.length < 8) {
        return false;
    }

    // Check for uppercase, lowercase, number, and special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    // All criteria must be met
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
