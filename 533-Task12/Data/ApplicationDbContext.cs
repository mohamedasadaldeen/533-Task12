using Microsoft.EntityFrameworkCore;
using _533_Task12.Models;

namespace _533_Task12.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<TodoTask> TodoTasks { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseSqlServer("Data Source=.;initial catalog=ToDoListApp;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;");
        }
    }
}
