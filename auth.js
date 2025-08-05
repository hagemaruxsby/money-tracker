import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const authForm = document.getElementById('authForm');
  const authMessage = document.getElementById('authMessage');
  console.log('DOM loaded');
  console.log('Register button:', registerBtn);
  console.log('Login button:', loginBtn);
  console.log('Auth form:', authForm);
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
      window.location.href = 'https://hagemaruxsby.github.io/money-tracker/transactions.html';
    } catch (err) {
      console.error('Unexpected login error:', err);
      setAuthMessage('An unexpected error occurred: ' + err.message);
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://hagemaruxsby.github.io/money-tracker/transactions.html'
        }
      });
      console.log('Sign up response:', data);

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
      setAuthMessage('An unexpected error occurred: ' + err.message);
      registerBtn.disabled = false;
    }
  }

  // Check session on page load
  async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return;
    }
    if (session) {
      console.log('User is authenticated, redirecting to transactions.html');
      window.location.href = 'https://hagemaruxsby.github.io/money-tracker/transactions.html';
    }
  }
  checkSession();

  if (loginBtn && registerBtn && authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
    registerBtn.addEventListener('click', handleRegister);
    console.log('Login form and Register button event listeners attached');
  } else {
    console.error('One or more elements not found:', {
      loginBtn,
      registerBtn,
      authForm: document.getElementById('authForm')
    });
  }
});
