# this is a dumping page

## START OF MYSQL

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filename VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255)
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    upload_id INT,
    name VARCHAR(255) NOT NULL,
    due_date DATE,
    max_points INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE SET NULL
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assignment_id INT NOT NULL,
    teacher_id INT NOT NULL,
    upload_id INT,
    grade FLOAT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE SET NULL
);

CREATE TABLE parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_student (
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    PRIMARY KEY (parent_id, student_id),
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE login_attempt (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_type ENUM('teacher', 'parent', 'student') NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failure') NOT NULL
);


## END OF MYSQL

### attempt to create the database:
Success
#### trying to get the csv upload to work now
##Success

used:
curl -X POST   -F "file=@upload_template"   "http://localhost:8081/api/uploads/template?teacherId=1&notes=Test"

trying to get react main page to work now.

### NO GO!!!!
I couldn't get the index.html to load, but I think the issue is in trying to force some tests locally, and then deploy...I'm just going to see if I can get everything poingting to gradeinsight.com

##Success
Perfect — the React frontend built successfully ✅

Your production-ready files are now in:
/home/len/react_grade_insight/frontend/build

# SUCCESS!!!!! ===== gradeinsight.com is up and running --- except nothing works....but that's ok!!!!
it can be seen!!!!!!

# login page
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zennoma - Begin your Adventure</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <a href="#" class="nav-logo">ZENNOMA</a>
        <div class="nav-links">
            <a href="#" class="nav-link">Home</a>
            <a href="#" class="nav-link">About</a>
            <a href="#" class="nav-link">Security</a>
            <a href="#" class="nav-link">Contact</a>
        </div>
    </nav>

    <div class="hero-container">
        <div class="overlay"></div>
        <div class="content">
            <div class="content-inner">
                <h1 class="hero-text" id="heroText">Zennoma.<br>Secure.<br>Anonymous.<br>Yours.</h1>
                <div class="login-form" id="loginForm">
                    <h2 class="login-title">Secure Access</h2>
                    <form>
                        <div class="form-group">
                            <label class="form-label" for="username">Username</label>
                            <input type="text" id="username" class="form-input" placeholder="Enter your username">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="password">Password</label>
                            <input type="password" id="password" class="form-input" placeholder="Enter your password">
                        </div>
                        <button type="submit" class="login-button">Sign In</button>
                        <div class="signup-link">
                            Don't have an account? <a href="#">Sign up</a>
                        </div>
                    </form>
                </div>
                <a href="#" class="adventure-button" id="adventureButton">Begin your Adventure</a>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('adventureButton').addEventListener('click', function(e) {
            e.preventDefault();

            const heroText = document.getElementById('heroText');
            const loginForm = document.getElementById('loginForm');
            const button = document.getElementById('adventureButton');

            // Fade out hero text and button, fade in login form simultaneously
            heroText.classList.add('fade-out');
            button.classList.add('fade-out');
            loginForm.classList.add('fade-in');
        });
    </script>
</body>
</html>

# CSS that goes with it
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%);
    padding: 50px;
    margin: 0;
    min-height: 100vh;
    position: relative;
}

.navbar {
    position: absolute;
    top: 0;
    left: 50px;
    right: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 20;
}

.nav-logo {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.125rem;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 0.1em;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
}

.nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 400;
    transition: color 0.3s ease;
    letter-spacing: 0.02em;
}

.nav-link:hover {
    color: rgba(255, 255, 255, 0.9);
}

.hero-container {
    height: calc(100vh - 100px);
    background-image: url("/Assets/img/bgAdventure.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.1);
}

.hero-container::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 14px;
    z-index: -1;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
}

.content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
    text-align: right;
    padding: 0 80px 0 24px;
}

.content-inner {
    max-width: 500px;
    position: relative;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hero-text {
    font-size: 2.5rem;
    font-weight: 200;
    color: #131D4F;
    line-height: 1.2;
    margin-bottom: 48px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transition: opacity 0.6s ease-in-out;
    letter-spacing: -0.02em;
}

.hero-text.fade-out {
    opacity: 0;
}

.login-form {
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 280px;
    min-height: 400px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 40px 30px;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 1px 0 rgba(255, 255, 255, 0.2) inset,
        0 -1px 0 rgba(0, 0, 0, 0.1) inset;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-form.fade-in {
    opacity: 1;
}

.login-title {
    font-size: 1.75rem;
    font-weight: 200;
    color: #131D4F;
    text-align: center;
    margin-bottom: 32px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: -0.01em;
}

.form-group {
    margin-bottom: 24px;
}

.form-label {
    display: block;
    color: #131D4F;
    font-size: 0.875rem;
    font-weight: 400;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
}

.form-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px 16px;
    color: #131D4F;
    font-size: 1rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
}

.form-input::placeholder {
    color: rgba(19, 29, 79, 0.6);
}

.form-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.login-button {
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #131D4F;
    padding: 14px 24px;
    font-size: 1rem;
    font-weight: 400;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;
    margin-top: 8px;
    box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.2),
        0 1px 0 rgba(255, 255, 255, 0.2) inset;
}

.login-button:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
    transform: translateY(-1px);
    box-shadow: 
        0 6px 20px rgba(0, 0, 0, 0.3),
        0 1px 0 rgba(255, 255, 255, 0.3) inset;
}

.signup-link {
    text-align: center;
    color: #131D4F;
    font-size: 0.875rem;
}

.signup-link a {
    color: #131D4F;
    text-decoration: none;
    font-weight: 400;
    transition: color 0.3s ease;
}

.signup-link a:hover {
    color: rgba(19, 29, 79, 0.8);
}

.adventure-button {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #131D4F;
    padding: 8px 16px;
    font-size: 1.125rem;
    font-weight: 400;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-in-out;
    text-decoration: none;
    display: inline-block;
    width: fit-content;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 1px 0 rgba(255, 255, 255, 0.2) inset,
        0 -1px 0 rgba(0, 0, 0, 0.1) inset;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.02em;
}

.adventure-button.fade-out {
    opacity: 0;
}

.adventure-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
}

.adventure-button:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
    transform: translateY(-2px) scale(1.02);
    box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.4),
        0 1px 0 rgba(255, 255, 255, 0.3) inset,
        0 -1px 0 rgba(0, 0, 0, 0.1) inset;
}

.adventure-button:hover::before {
    left: 100%;
}

/* Responsive Design */
@media (min-width: 768px) {
    .hero-text {
        font-size: 3.5rem;
    }

    .content {
        padding: 0 120px 0 24px;
    }
}





