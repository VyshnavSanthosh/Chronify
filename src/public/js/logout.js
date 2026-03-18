document.addEventListener('DOMContentLoaded', () => {
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const vendorLogoutBtn = document.getElementById('vendorLogoutBtn');

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout('/admin/auth/logout', 'admin panel');
        });
    }

    if (vendorLogoutBtn) {
        vendorLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout('/vendor/auth/logout', 'vendor panel');
        });
    }

    async function handleLogout(url, panelName) {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You will be logged out of the ${panelName}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, logout!',
            background: '#1f2937',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.redirected) {
                    window.location.href = response.url;
                } else if (response.ok) {
                    window.location.href = url.replace('/logout', '/login');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Logout Failed',
                        text: 'Something went wrong. Please try again.',
                        background: '#1f2937',
                        color: '#fff'
                    });
                }
            } catch (error) {
                console.error('Logout error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Logout Error',
                    text: 'Failed to connect to the server.',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    }
});
