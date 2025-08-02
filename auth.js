import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const authMessage = document.getElementById('authMessage');
  console.log('Register button:', registerBtn);
  console.log('Login button:', loginBtn);
  console.log('Auth message:', authMessage);

  function setAuthMessage(message, isError = true) {
    console.log('Setting auth message:', message, isError);
    authMessage.textContent = message;
    authMessage.className = isError ? 'text-red-600' : 'text-green-600';
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
  }

  async function handleLogin() {
    console.log('handleLogin called');
    setAuthMessage('');
    loginBtn.disabled = true;

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    console.log('Login - Email:', email, 'Password:', password);

    if (!email || !password) {
      setAuthMessage('Please fill in all fields.');
      loginBtn.disabled = false;
      return;
    }

    if (!validateEmail(email)) {
      setAuthMessage('Please enter a valid email address.');
      loginBtn.disabled = false;
      return;
    }

    try {
      console.log('Attempting Supabase signIn');
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('Login error:', loginError);
        setAuthMessage('Invalid email or password.');
        loginBtn.disabled = false;
        return;
      }

      setAuthMessage('Login successful!', false);
      window.location.href = './transactions.html';
    } catch (err) {
      console.error('Unexpected login error:', err);
      setAuthMessage('An unexpected error occurred.');
      loginBtn.disabled = false;
    }
  }

  async function handleRegister() {
    console.log('handleRegister called');
    setAuthMessage('');
    registerBtn.disabled = true;

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    console.log('Register - Email:', email, 'Password:', password);

    if (!email || !password) {
      setAuthMessage('Please fill in all fields.');
      registerBtn.disabled = false;
      return;
    }

    if (!validateEmail(email)) {
      setAuthMessage('Please enter a valid email address.');
      registerBtn.disabled = false;
      return;
    }

    if (!validatePassword(password)) {
      setAuthMessage('Password must be at least 8 characters, with uppercase, lowercase, numbers, and special characters.');
      registerBtn.disabled = false;
      return;
    }

    try {
      console.log('Attempting Supabase signUp');
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setAuthMessage('Registration failed: ' + signUpError.message);
        registerBtn.disabled = false;
        return;
      }

      console.log('Sign up successful');
      setAuthMessage('Registration successful! Please check your email to confirm your account.', false);
    } catch (err) {
      console.error('Unexpected signUp error:', err);
      setAuthMessage('An unexpected error occurred.');
      registerBtn.disabled = false;
    }
  }

  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  else console.error('Login button not found');
  if (registerBtn) registerBtn.addEventListener('click', handleRegister);
  else console.error('Register button not found');
});