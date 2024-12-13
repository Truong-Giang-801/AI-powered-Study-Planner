using FirebaseAdmin.Auth;
using TaskManagementApp.Models;
using System.Threading.Tasks;
using AuthResult = TaskManagementApp.Services.AuthResult;  // Alias to avoid ambiguity
using Task = System.Threading.Tasks.Task;  // Alias to avoid ambiguity

namespace TaskManagementApp.Services
{
    public class AuthService
    {
        public async Task<AuthResult> RegisterUserAsync(UserRegistrationDto userDto)
        {
            var userRecordArgs = new UserRecordArgs
            {
                Email = userDto.Email,
                Password = userDto.Password,
            };

            try
            {
                var userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(userRecordArgs);
                return new AuthResult { Success = true, Message = "User registered successfully" };
            }
            catch (FirebaseAuthException ex)
            {
                return new AuthResult { Success = false, Message = ex.Message };
            }
        }

        public async Task<AuthResult> LoginUserAsync(UserLoginDto userDto)
        {
            // Simulate asynchronous operation
            await Task.Delay(500);

            // Return successful login result
            return new AuthResult { Success = true, Message = "User logged in successfully" };
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
