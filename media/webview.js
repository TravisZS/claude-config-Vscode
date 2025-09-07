(function() {
    const vscode = acquireVsCodeApi();
    
    let profiles = [];
    let activeProfileId = null;
    let editingProfileId = null;

    // DOM Elements
    const elements = {
        profilesList: null,
        addProfileBtn: null,
        refreshBtn: null,
        profileModal: null,
        profileForm: null,
        closeModal: null,
        cancelForm: null,
        modalTitle: null,
        activeProfileStatus: null,
        profileCount: null,
        toggleApiKey: null,
        apiKeyInput: null
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        setupEventListeners();
        requestProfiles();
    });

    function initializeElements() {
        elements.profilesList = document.getElementById('profilesList');
        elements.addProfileBtn = document.getElementById('addProfile');
        elements.refreshBtn = document.getElementById('refreshProfiles');
        elements.profileModal = document.getElementById('profileModal');
        elements.profileForm = document.getElementById('profileForm');
        elements.closeModal = document.getElementById('closeModal');
        elements.cancelForm = document.getElementById('cancelForm');
        elements.modalTitle = document.getElementById('modalTitle');
        elements.activeProfileStatus = document.getElementById('activeProfileStatus');
        elements.profileCount = document.getElementById('profileCount');
        elements.toggleApiKey = document.getElementById('toggleApiKey');
        elements.apiKeyInput = document.getElementById('apiKey');
    }

    function setupEventListeners() {
        // Modal controls
        elements.addProfileBtn.addEventListener('click', () => openAddModal());
        elements.closeModal.addEventListener('click', closeModal);
        elements.cancelForm.addEventListener('click', closeModal);
        elements.refreshBtn.addEventListener('click', requestProfiles);

        // Form submission
        elements.profileForm.addEventListener('submit', handleFormSubmit);

        // API key visibility toggle
        elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);

        // Modal backdrop click
        elements.profileModal.addEventListener('click', (e) => {
            if (e.target === elements.profileModal) {
                closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.profileModal.classList.contains('show')) {
                closeModal();
            }
        });

        // Listen for messages from extension
        window.addEventListener('message', handleExtensionMessage);
    }

    function handleExtensionMessage(event) {
        const message = event.data;
        
        switch (message.type) {
            case 'profilesData':
                profiles = message.profiles;
                activeProfileId = message.activeProfileId;
                renderProfiles();
                updateStatusBar();
                break;
                
            case 'validationError':
                showValidationErrors(message.errors);
                break;
        }
    }

    function requestProfiles() {
        vscode.postMessage({ type: 'getProfiles' });
    }

    function renderProfiles() {
        if (!profiles.length) {
            elements.profilesList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <h3>No Profiles Found</h3>
                    <p>Create your first Claude configuration profile to get started.</p>
                </div>
            `;
            return;
        }

        elements.profilesList.innerHTML = profiles.map(profile => {
            const isActive = profile.id === activeProfileId;
            const maskedApiKey = profile.apiKey ? '•'.repeat(20) : 'Not set';
            const canDelete = profiles.length > 1; // 只要有多个配置就可以删除
            
            return `
                <div class="profile-card ${isActive ? 'active' : ''}" data-profile-id="${profile.id}">
                    <div class="profile-header">
                        <div class="profile-info">
                            <h3>
                                ${escapeHtml(profile.name)}
                                ${isActive ? '<span class="profile-status">Active</span>' : ''}
                            </h3>
                        </div>
                        <div class="profile-actions">
                            ${!isActive ? `<button class="btn btn-success btn-sm" onclick="switchProfile('${profile.id}')">
                                <span class="icon">🔄</span> Switch
                            </button>` : ''}
                            <button class="btn btn-secondary btn-sm" onclick="editProfile('${profile.id}')">
                                <span class="icon">✏️</span> Edit
                            </button>
                            ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="deleteProfile('${profile.id}')">
                                <span class="icon">🗑️</span> Delete
                            </button>` : ''}
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <div class="detail-group">
                            <div class="detail-label">API Key</div>
                            <div class="detail-value masked">${maskedApiKey}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">Base URL</div>
                            <div class="detail-value">${escapeHtml(profile.baseUrl)}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">Disable Traffic</div>
                            <div class="detail-value">${profile.disableNonEssentialTraffic ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                    
                    <div class="profile-timestamps">
                        <span>Created: ${formatDate(profile.createdAt)}</span>
                        <span>Updated: ${formatDate(profile.updatedAt)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateStatusBar() {
        const activeProfile = profiles.find(p => p.id === activeProfileId);
        
        if (activeProfile) {
            elements.activeProfileStatus.textContent = `Active Profile: ${activeProfile.name}`;
        } else {
            elements.activeProfileStatus.textContent = 'No active profile';
        }
        
        elements.profileCount.textContent = `${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`;
    }

    // Global functions for onclick handlers
    window.switchProfile = function(profileId) {
        vscode.postMessage({
            type: 'switchProfile',
            profileId: profileId
        });
    };

    window.editProfile = function(profileId) {
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            openEditModal(profile);
        }
    };

    window.deleteProfile = function(profileId) {
        const profile = profiles.find(p => p.id === profileId);
        if (profile && confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
            vscode.postMessage({
                type: 'deleteProfile',
                profileId: profileId
            });
        }
    };

    function openAddModal() {
        editingProfileId = null;
        elements.modalTitle.textContent = 'Add New Profile';
        elements.profileForm.reset();
        
        // Set default values
        document.getElementById('baseUrl').value = 'https://api.anthropic.com';
        document.getElementById('disableNonEssentialTraffic').checked = true;
        
        elements.profileModal.classList.add('show');
        document.getElementById('profileName').focus();
    }

    function openEditModal(profile) {
        editingProfileId = profile.id;
        elements.modalTitle.textContent = 'Edit Profile';
        
        document.getElementById('profileName').value = profile.name;
        document.getElementById('apiKey').value = profile.apiKey;
        document.getElementById('baseUrl').value = profile.baseUrl;
        document.getElementById('disableNonEssentialTraffic').checked = !!profile.disableNonEssentialTraffic;
        
        elements.profileModal.classList.add('show');
        document.getElementById('profileName').focus();
    }

    function closeModal() {
        elements.profileModal.classList.remove('show');
        elements.profileForm.reset();
        editingProfileId = null;
        clearValidationErrors();
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        console.log('Form submitted!'); // Debug log
        
        const formData = new FormData(elements.profileForm);
        const profileData = {
            name: formData.get('profileName').trim(),
            apiKey: formData.get('apiKey').trim(),
            baseUrl: formData.get('baseUrl').trim(),
            disableNonEssentialTraffic: formData.has('disableNonEssentialTraffic')
        };

        console.log('Profile data:', profileData); // Debug log

        if (editingProfileId) {
            console.log('Updating profile:', editingProfileId); // Debug log
            vscode.postMessage({
                type: 'updateProfile',
                profileId: editingProfileId,
                profile: profileData
            });
        } else {
            console.log('Adding new profile'); // Debug log
            vscode.postMessage({
                type: 'addProfile',
                profile: profileData
            });
        }

        closeModal();
    }

    function toggleApiKeyVisibility() {
        const input = elements.apiKeyInput;
        const button = elements.toggleApiKey;
        
        if (input.type === 'password') {
            // Show password - open eye
            input.type = 'text';
            button.textContent = '👁️';
        } else {
            // Hide password - closed eye
            input.type = 'password';
            button.textContent = '🙈';
        }
    }

    function showValidationErrors(errors) {
        clearValidationErrors();
        
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error';
            errorDiv.textContent = error;
            elements.profileForm.insertBefore(errorDiv, elements.profileForm.firstChild);
        });
    }

    function clearValidationErrors() {
        const errors = elements.profileForm.querySelectorAll('.validation-error');
        errors.forEach(error => error.remove());
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Add validation error styles
    const style = document.createElement('style');
    style.textContent = `
        .validation-error {
            background: var(--danger-color);
            color: white;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius);
            margin-bottom: var(--spacing-md);
            font-size: 13px;
        }
        
        .btn-sm {
            padding: 4px 8px;
            font-size: 11px;
        }
        
        .btn .icon {
            font-size: 12px;
        }
        
        .profile-actions {
            display: flex;
            gap: 4px;
        }
    `;
    document.head.appendChild(style);
})();