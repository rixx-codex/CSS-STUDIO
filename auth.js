// auth.js - DNHS Portal Security Logic

// 1. SUPABASE INITIALIZATION
const SUPABASE_URL = 'https://idogseqqmarwtmfouxzb.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_2AoaiMV6mUFjqKtKr-1sfg_BEt-9MH_';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ADMIN CONFIGURATION
const ADMIN_EMAIL = 'maricris.arenas1017@gmail.com'; 

/**
 * HANDLE LOGIN
 */
async function handleLogin(email, password) {
    try {
        showLoading('SYNCING TERMINAL', 'Verifying Digital Signature...');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        if (data.user) {
            const is_admin = data.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            
            showSuccess(is_admin ? 'ADMIN ACCESS GRANTED' : 'STUDENT ACCESS GRANTED');

            setTimeout(() => {
                window.location.href = is_admin ? 'admin-dashboard.html' : 'student-dashboard.html';
            }, 2000);
        }
    } catch (err) {
        showError(err.message);
    }
}

/**
 * HANDLE SIGN UP (Para sa mga bagong Estudyante)
 */
async function handleSignUp(email, password, fullName) {
    try {
        showLoading('ENROLLING STUDENT', 'Creating Secure Profile...');

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'student'
                }
            }
        });

        if (error) throw error;

        Swal.fire({
            icon: 'success',
            title: 'ENROLLMENT SUCCESS',
            text: 'You can now log in to the terminal.',
            background: '#0b1120',
            color: '#fff'
        });

    } catch (err) {
        showError(err.message);
    }
}

/**
 * SESSION CHECKER
 * Ilagay ito sa simula ng bawat page (Admin/Student)
 */
async function checkSession(requiredRole) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const is_admin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // Protection: Kung student trying to access admin
    if (requiredRole === 'admin' && !is_admin) {
        window.location.href = 'student-dashboard.html';
    }
    
    // Protection: Kung admin trying to access student dashboard
    if (requiredRole === 'student' && is_admin) {
        window.location.href = 'admin-dashboard.html';
    }

    return user;
}

/**
 * HELPER UI FUNCTIONS
 */
function showLoading(title, subtitle) {
    Swal.fire({
        title: title,
        html: `
            <div class="flex flex-col items-center py-6">
                <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">${subtitle}</p>
            </div>
        `,
        showConfirmButton: false,
        background: '#0b1120',
        color: '#fff',
        allowOutsideClick: false
    });
}

function showSuccess(title) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: 'Initializing encrypted session...',
        background: '#0b1120',
        color: '#fff',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'ACCESS REJECTED',
        text: message,
        background: '#0b1120',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
    });
}
