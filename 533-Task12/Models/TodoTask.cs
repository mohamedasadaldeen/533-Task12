using System.ComponentModel.DataAnnotations;

namespace _533_Task12.Models
{
    public class TodoTask
    {
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string Title { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        [Required]
        public DateTime Deadline { get; set; }

        public string? File { get; set; }
    }
}