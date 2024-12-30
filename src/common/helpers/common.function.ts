import * as JWT from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Twilio } from 'twilio';

// const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export class CommonFunction {
    private readonly saltRounds = 10;
    private readonly secretKey = process.env.JWT_SECRET_KEY;

    async generateToken(userId: string): Promise<string> {
        console.log('ooo', this.secretKey)
        return JWT.sign({ userId }, this.secretKey, { expiresIn: '12h' });
    }

    async generateOtp(): Promise<number> {
        return Math.floor(100000 + Math.random() * 900000);
    }

    async hashPassword(password: string): Promise<string> {
        console.log('888888', typeof this.saltRounds)
        const salt = await bcrypt.genSalt(this.saltRounds);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    // async checkPhoneNumber(phoneNumber: string): Promise<boolean> {
    //     try {
    //         const phoneInfo = await client.lookups.v1.phoneNumbers(phoneNumber).fetch({
    //             type: ['carrier']
    //         });
    
    //         if (phoneInfo.carrier && phoneInfo.carrier.type !== 'voip') {
    //             // This is a valid, non-VoIP phone number.
    //             return true;
    //         } else {
    //             // This is a virtual or invalid phone number.
    //             return false;
    //         }
    //     } catch (error) {
    //         console.error('Error validating phone number:', error);
    //         return false;
    //     }
    // }

    // async sendOTP(phoneNumber: string): Promise<boolean> {
    //     try {
    //         await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
    //             .verifications
    //             .create({
    //                 to: phoneNumber,
    //                 channel: 'sms'  // or 'call' for voice verification
    //             });
    
    //         console.log('OTP sent successfully');
    //         return true;
    //     } catch (error) {
    //         console.error('Error sending OTP:', error);
    //         return false;
    //     }
    // }

    // async validateAndSendOTP(phoneNumber: string): Promise<boolean> {
    //     try {
    //         // Step 1: Check if the phone number is valid and not a VoIP number
    //         const phoneInfo = await client.lookups.v1.phoneNumbers(phoneNumber).fetch({
    //             type: ['carrier']
    //         });
    
    //         if (!phoneInfo.carrier || phoneInfo.carrier.type === 'voip') {
    //             console.log('This is a virtual or invalid phone number.');
    //             return false;
    //         }
    
    //         // Step 2: Send OTP if the phone number is valid
    //         await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
    //             .verifications
    //             .create({
    //                 to: phoneNumber,
    //                 channel: 'sms' // Use 'call' for voice verification if needed
    //             });
    
    //         console.log('OTP sent successfully');
    //         return true;
    
    //     } catch (error) {
    //         console.error('Error validating or sending OTP:', error);
    //         return false;
    //     }
    // }

    // async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    //     try {
    //         const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
    //             .verificationChecks
    //             .create({
    //                 to: phoneNumber,
    //                 code: code,
    //             });
    
    //         console.log('Verification status:', verificationCheck.status);
    //         return verificationCheck.status === 'approved';
    //     } catch (error) {
    //         console.error('Error verifying OTP:', error);
    //         return false;
    //     }
    // }
    
}
