require("dotenv").config(); // יבוא הנתונים מenv

const { Pool } = require("pg"); // ייבא את המודיול 

const isProduction = process.env.NODE_ENV === 'production'; 
                //return object contain the user env, if the value of NODE_ENV === production 

const connectionString = 'postgresql://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@'+process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB_DATABASE;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
    // אם הפונקציה מוציאה אמ, תשתמש בדרך שמוגדרת לך בתוך הסביבה
    // אם שקר - התהליך לא בסביבה של "יצור" אז תכניס לו את הדרך הבאה
});

module.exports = { pool };
