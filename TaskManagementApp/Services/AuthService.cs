using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace TaskManagementApp.Services
{
    public class AuthService
    {
        public async Task<AuthResult> LinkProviderAsync(string uid, string idToken)
        {
            try
            {
                // Verify the ID token
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                var userUid = decodedToken.Uid;

                // Check if the UID matches
                if (userUid != uid)
                {
                    return new AuthResult { Success = false, Message = "UID mismatch." };
                }

                // The actual linking of the Google provider happens in the client-side code
                return new AuthResult { Success = true, Message = "ID token verified successfully!" };
            }
            catch (FirebaseAuthException ex)
            {
                return new AuthResult { Success = false, Message = ex.Message };
            }
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
