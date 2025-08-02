import { supabase } from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout");
  console.log('Logout button:', logoutButton);
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      console.log('Logout button clicked');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert("Logout failed: " + error.message);
      } else {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  } else {
    console.error('Logout button not found');
  }
});