import express, { json, query }  from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import ejs from "ejs";
import cors from "cors"
import session from "express-session";
import nodemailer from "nodemailer";

env.config();

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

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS, // Your Gmail email address
        pass: process.env.EMAIL_PASSWORD // Your Gmail password
    }
});

const port = 8080;
// Used for hashing the passwords
const saltRounds = 10;

const secretKey = process.env.SECRET;

const app = express();

app.use(cors());

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.set('view engine', 'ejs'); // Set EJS as the default template engine

app.set("views", "views");


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

// POST route for login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Check if email exists in the admin table
        const query = `SELECT * FROM Admin WHERE email = $1`;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        } else {
            const admin = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, admin.password);

            if (passwordMatch) {
                // Set the user as logged in
                isLoggedIn = true;
                res.status(200).json({ message: "Logged in successfully" });
            } else {
                return res.status(401).json({ error: "Invalid email or password." });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/logout", (req, res) => {
    isLoggedIn = false;
});

app.get("/get-unapproved-dentist", async (req, res) => {
    
    try {
        const query = `SELECT * FROM Doctors WHERE isApproved = false`;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }

});

app.get("/get-dentist-by-name", async (req, res) => {
    try {
        const name = req.query.name;
        const isBanned = req.query.isBanned;

        if (isBanned === "true") {
            const query = `SELECT * FROM Doctors WHERE (first_name ILIKE $1 OR last_name ILIKE $1) AND isBanned = true`;
            const result = await db.query(query, [`%${name}%`]); // Use ILIKE and wildcard (%)
            res.status(200).json(result.rows);
            return;
        } else if (isBanned === "false") {
            const query = `SELECT * FROM Doctors WHERE (first_name ILIKE $1 OR last_name ILIKE $1) AND isBanned = false`;
            const result = await db.query(query, [`%${name}%`]); // Use ILIKE and wildcard (%)
            res.status(200).json(result.rows);
            return;
        } else {
            const query = `SELECT * FROM Doctors WHERE (first_name ILIKE $1 OR last_name ILIKE $1)`;
            const result = await db.query(query, [`%${name}%`]); // Use ILIKE and wildcard (%)
            res.status(200).json(result.rows); 
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/get-dentist-by-id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM Doctors WHERE id = $1`;
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/approve-dentist/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const query = `UPDATE Doctors SET isApproved = true WHERE id = $1`;
        await db.query(query, [id]);
        const email = req.body.dentistEmail;
        console.log(email);
        await sendApprovalEmail(email);
        res.status(200).json({ message: "Dentist approved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
    
});

app.post("/reject-dentist/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const query = `DELETE FROM Doctors WHERE id = $1`;
        await db.query(query, [id]);
        const email = req.body.dentistEmail;
        await sendRejectionEmail(email);
        res.status(200).json({ message: "Dentist rejected successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/ban-dentist", async (req, res) => {

    try {
        const id = req.query.id;
        const reason = req.query.reason;
        const query = `UPDATE Doctors SET isBanned = true, Reason = $1 WHERE id = $2`;
        await db.query(query, [reason, id]);
        res.status(200).json({ message: "Dentist banned successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/get-patient-by-id/:id", async (req, res) => {
   
    try {
        const id = req.params.id;
        const query = `SELECT * FROM USERS WHERE id = $1`;
        const result = await db.query(query, [id]);

        // get absense record from appointments table
        const query2 = `SELECT Appointment_datetime AS appointment_date FROM APPOINTMENTS WHERE user_id = $1 AND status = 'Absent'`;
        const result2 = await db.query(query2, [id]);

        result.rows[0].absentDates = result2.rows.map(row => row.appointment_date);

        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }

});

app.get("/search-patients", async (req, res) => {
   
    try {
        const name = req.query.name;
        const query = `SELECT * FROM USERS WHERE (firstname ILIKE $1 OR lastname ILIKE $1)`;
        const result = await db.query(query, [`%${name}%`]); // Use ILIKE and wildcard (%)
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/ban-patient", async (req, res) => {
   
    try{
        const id = req.query.id;
        const reason = req.query.reason;
        const query = `UPDATE USERS SET isBanned = true, Reason = $1 WHERE id = $2`;
        await db.query(query, [reason, id]);
        res.status(200).json({ message: "Patient banned successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }

});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

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

async function sendApprovalEmail(email) {
    // User exists, create a one-time link valid for 15 minutes
    const secret = secretKey; // Use the same secretKey for signing
    const payload = {
        email: email,
    }

    // Define email content
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // Sender address
        to: email, // Recipient address
        subject: "Approval Email", // Email subject
        html: `
            <p>Congratulations, your account has been approved:</p>
            <p>We hope you enjoy using our platform.</p>
        ` // Email body with password reset link
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Approval email sent to:", email);
        return "Approval email sent";
    } catch (error) {
        console.error("Error sending Approval email:", error);
        return "An error occurred while sending the Approval email";
    }
}

async function sendRejectionEmail(email) {
    // User exists, create a one-time link valid for 15 minutes
    const secret = secretKey; // Use the same secretKey for signing
    const payload = {
        email: email,
    }

    // Define email content
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // Sender address
        to: email, // Recipient address
        subject: "Rejection Email", // Email subject
        html: `
            <p>Sorry, your account has been rejected:</p>
            <p>Try registering again later.</p>
        ` // Email body with password reset link
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Rejection email sent to:", email);
        return "Rejection email sent";
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return "An error occurred while sending the verification email";
    }
}


// Scrapped code

// app.get("/create-admin", async (req, res) => {
   
//     try{
//      
//         const email = "anasardah543@gmail.com";
//         const hash = await hashPassword(password);
//         const query = `INSERT INTO Admin (email, password) VALUES ($1, $2)`;
//         await db.query(query, [email, hash]);
//         console.log("User inserted successfully");
//         return res.sendStatus(200);        
//     }  catch (err) {
//         console.error("Error:", err);
//         return res.sendStatus(500);
// }
    
// });
