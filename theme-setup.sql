-- Add theme preference column to users table
ALTER TABLE tbluser 
ADD COLUMN user_theme VARCHAR(10) DEFAULT 'light';

-- Add constraint to ensure only valid theme values
ALTER TABLE tbluser 
ADD CONSTRAINT chk_user_theme 
CHECK (user_theme IN ('light', 'dark'));
