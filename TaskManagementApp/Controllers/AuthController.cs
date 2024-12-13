using Microsoft.AspNetCore.Mvc;
using TaskManagementApp.Services;
using TaskManagementApp.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegistrationDto userDto)
    {
        var result = await _authService.RegisterUserAsync(userDto);
        if (!result.Success)
        {
            return BadRequest(result.Message);
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto userDto)
    {
        var result = await _authService.LoginUserAsync(userDto);
        if (!result.Success)
        {
            return Unauthorized(result.Message);
        }

        return Ok(result);
    }
}
