// Store the token in localStorage after login
let token = localStorage.getItem('adminToken');

// Check if token exists, if not redirect to login
if (!token) {
    window.location.href = '/auth/login.html';
}

// Add token to all fetch requests
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Load monitored users
async function loadMonitoredUsers() {
    try {
        const response = await fetch('/api/admin/monitored-users', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const users = await response.json();
        
        const tbody = document.getElementById('monitoredUsersTable');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.email}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.role}</td>
                <td>${user.lastLoginAt ? user.lastLoginAt : 'Never'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading monitored users:', error);
    }
}

// Load suspicious activity
async function loadSuspiciousActivity() {
    try {
        const response = await fetch('/api/admin/suspicious-activity', { headers });
        const activities = await response.json();
        
        const tbody = document.getElementById('suspiciousActivityTable');
        tbody.innerHTML = '';
        
        activities.forEach(activity => {
            const tr = document.createElement('tr');
            tr.className = activity.isMonitored ? 'activity-high' : '';
            tr.innerHTML = `
                <td>${activity.email}</td>
                <td>${activity.actionCount || 'N/A'}</td>
                <td class="${activity.isMonitored ? 'status-monitored' : 'status-normal'}">
                    ${activity.isMonitored ? 'Monitored' : 'Normal'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading suspicious activity:', error);
    }
}

// Load recent activity logs
async function loadActivityLogs() {
    try {
        const response = await fetch('/api/admin/activity-logs', { headers });
        const logs = await response.json();
        
        const tbody = document.getElementById('activityLogsTable');
        tbody.innerHTML = '';
        
        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(log.timestamp)}</td>
                <td>${log.user.email}</td>
                <td>${log.action}</td>
                <td>${log.entityType}</td>
                <td>${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

// Load admin info
async function loadAdminInfo() {
    try {
        const response = await fetch('/auth/me', { headers });
        const admin = await response.json();
        document.getElementById('adminName').textContent = `${admin.firstName} ${admin.lastName}`;
    } catch (error) {
        console.error('Error loading admin info:', error);
        // If unauthorized, redirect to login
        if (error.status === 401) {
            window.location.href = '/auth/login';
        }
    }
}

// Refresh data every 30 seconds
function startAutoRefresh() {
    loadMonitoredUsers();
    loadSuspiciousActivity();
    loadActivityLogs();
    loadAdminInfo();
    
    setInterval(() => {
        loadMonitoredUsers();
        loadSuspiciousActivity();
        loadActivityLogs();
    }, 30000);
}

// Start the dashboard
document.addEventListener('DOMContentLoaded', startAutoRefresh);

// Poll every 5 seconds
setInterval(loadMonitoredUsers, 5000);
window.onload = loadMonitoredUsers; 