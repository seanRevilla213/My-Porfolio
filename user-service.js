// user-service.js
class UserService {
    static async updateUserProfile(uid, userData) {
        try {
            await db.collection('users').doc(uid).update({
                ...userData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getUserProfile(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                return {
                    success: true,
                    data: userDoc.data()
                };
            } else {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getAcademicRecords(uid) {
        try {
            const recordsSnapshot = await db.collection('users')
                .doc(uid)
                .collection('academicRecords')
                .orderBy('semester', 'desc')
                .get();
            
            const records = [];
            recordsSnapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: records };
        } catch (error) {
            console.error('Error getting academic records:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getSchedule(uid, date) {
        try {
            const scheduleSnapshot = await db.collection('users')
                .doc(uid)
                .collection('schedule')
                .where('date', '==', date)
                .orderBy('startTime')
                .get();
            
            const schedule = [];
            scheduleSnapshot.forEach(doc => {
                schedule.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: schedule };
        } catch (error) {
            console.error('Error getting schedule:', error);
            return { success: false, error: error.message };
        }
    }
}

window.UserService = UserService;