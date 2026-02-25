// auth-service.js
class AuthService {
    static async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                await auth.signOut();
                throw new Error('Please verify your email address before logging in.');
            }
            
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User profile not found.');
            }
            
            const userData = userDoc.data();
            
            // Update last login time
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Store user data
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                ...userData
            }));
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                }
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }
    
    static async register(email, password, userData) {
        try {
            // Check if student ID already exists
            const existingUser = await db.collection('users')
                .where('studentId', '==', userData.studentId)
                .get();
            
            if (!existingUser.empty) {
                throw new Error('This Student ID is already registered.');
            }
            
            // Create user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Send email verification
            await user.sendEmailVerification();
            
            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                email: email,
                studentId: userData.studentId,
                fullName: userData.fullName,
                program: 'Not Selected',
                yearLevel: 'Not Selected',
                semester: 'Not Selected',
                schoolYear: '2025-2026',
                section: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: null,
                status: 'active',
                role: 'student'
            });
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                }
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }
    
    static async logout() {
        try {
            await auth.signOut();
            localStorage.removeItem('currentUser');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }
    
    static getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }
}

// Export for use in other files
window.AuthService = AuthService;