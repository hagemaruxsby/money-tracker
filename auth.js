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
      password,
      options: {
        emailRedirectTo: 'https://hagemaruxsby.github.io/money-tracker/index.html' // redirect after email confirmation
      }
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
