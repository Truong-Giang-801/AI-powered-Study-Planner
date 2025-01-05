using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Text.Json;
using TaskManagementApp.Services;
using Google.Cloud.Firestore;

namespace TaskManagementApp
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            // Set the environment variable for Google credentials
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", "Configs/serviceAccountKey.json");

            // Initialize FirebaseApp
            var googleCredential = GoogleCredential.FromFile("Configs/serviceAccountKey.json");
            var firebaseApp = FirebaseApp.Create(new AppOptions
            {
                Credential = googleCredential
            });

            Console.WriteLine($"FirebaseApp initialized successfully with ID: {firebaseApp.Name}");

            // Read project ID from the service account JSON file
            var json = File.ReadAllText("Configs/serviceAccountKey.json");
            var jsonDocument = JsonDocument.Parse(json);
            var projectId = jsonDocument.RootElement.GetProperty("project_id").GetString();
            if (string.IsNullOrEmpty(projectId))
            {
                throw new InvalidOperationException("Project ID cannot be null or empty.");
            }

            // Register FirestoreDb as a singleton service
            var firestoreDb = FirestoreDb.Create(projectId);
            services.AddSingleton(firestoreDb);

            Console.WriteLine($"FirestoreDb created successfully for project: {projectId}");

            services.AddSingleton<FirestoreService>();
            services.AddScoped<AuthService>();

            // Add CORS services
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors("AllowAllOrigins");
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}