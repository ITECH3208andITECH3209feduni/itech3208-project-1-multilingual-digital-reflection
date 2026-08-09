// import the Supabase client library from the CDN.
import { createClient }
    from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


// supabase configuration
// Use the same Supabase project URL as your backend.

const SUPABASE_URL = 'https://axhirebelwkzsncellxh.supabase.co';

// Use ONLY the anon key here.
// Never place the service-role key in frontend JavaScript.
const SUPABASE_ANON_KEY = 'sb_publishable_wvas5PH4QFod9WraSdtNmQ_3zXTqmqP';


// Create Supabase client.
const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// HTML elements

const form = document.getElementById('resetPasswordForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput =     document.getElementById('confirmPassword');
const message = document.getElementById('message');


// Reset password form submission handler

form.addEventListener('submit', async (event) => {

        // Prevent the browser from refreshing when the form is submitted.
        event.preventDefault();


        // Get password values.
        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        // Validate password length and match.

        if (password.length < 8) {

            message.className = 'auth-message error';
            message.textContent = 'Password must contain at least 8 characters.';

            return;
        }


        if (password !== confirmPassword) {

            message.className = 'auth-message error';
            message.textContent = 'Passwords do not match.';

            return;
        }


        message.className = 'auth-message';
        message.textContent = 'Updating password...';


       // Update the user's password using Supabase's auth.updateUser method.

        try {

            const { data, error } =
                await supabase.auth.updateUser({
                    password: password
                });


            // Check whether Supabase returned an error.
            if (error) {

                console.error(
                    'Password update error:',error
                );

                message.className = 'auth-message error';
                message.textContent = error.message;

                return;
            }


            // Password update successful.
            console.log(
                'Password updated:',
                data
            );


            message.className = 'auth-message success';

            message.textContent =
                    'Password updated successfully! Redirecting to login...';
            // Redirect to login page after a short delay.
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

            // Handle unexpected errors during the password update process.
        } catch (error) {

            console.error(
                'Unexpected password reset error:',error
            );


            message.className = 'auth-message error';
            message.textContent = 'Unable to update password.';
        }
    }
);