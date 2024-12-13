using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using TaskManagementApp.Services;
using Google.Cloud.Firestore;
using System.Text.Json;

namespace TaskManagementApp
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSingleton<FirebaseApp>(sp => 
            {
                var googleCredential = GoogleCredential.FromFile(
                    "Configs/serviceAccountKey.json"
                );

                var firebaseApp = FirebaseApp.Create(new AppOptions
                {
                    Credential = googleCredential
                });

                Console.WriteLine($"FirebaseApp initialized successfully with ID: {firebaseApp.Name}");

                // Create FirestoreDb instance using the FirebaseApp's projectId
                var firestoreDb = FirestoreDb.Create("authentication-57a28");
                Console.WriteLine($"FirestoreDb created successfully for project: {firebaseApp.Options.ProjectId}");

                return firebaseApp;
            });
            
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
