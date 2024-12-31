using Microsoft.AspNetCore.Mvc;
using TaskManagementApp.Services;
using TaskManagementApp.Models;
using System.Threading.Tasks;

namespace TaskManagementApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("link-provider")]
        public async Task<IActionResult> LinkProvider([FromBody] LinkProviderDto linkProviderDto)
        {
            var result = await _authService.LinkProviderAsync(linkProviderDto.Uid, linkProviderDto.IdToken);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result);
        }
    }
}
