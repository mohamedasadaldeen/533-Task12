using _533_Task12.Data;
using _533_Task12.Models;
using _533_Task12.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace _533_Task12.Controllers
{
    public class TaskController : Controller
    {
        private readonly ApplicationDbContext _context = new ApplicationDbContext();
        public IActionResult Index(FilterProductVM filter)
        {
            var todoTasks = _context.TodoTasks.AsQueryable();
            //OrderBy
            todoTasks = todoTasks.OrderBy(t => t.Deadline);
            if (filter.DeadFilter != null)
            {
                todoTasks = todoTasks.Where(t => t.Deadline.Date == filter.DeadFilter.Value.Date);
            }
            //Pagination
            ViewBag.TotalPages = (int)Math.Ceiling(todoTasks.Count() / 3.0);
            ViewBag.CurrentPage = filter.Page;
            todoTasks = todoTasks.Skip((filter.Page - 1) * 3).Take(3);
            //View
            return View(todoTasks.AsEnumerable());
        }

        //Create
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(TodoTask todoTask, IFormFile ImageFile)
        {
            //Image
            if (ImageFile != null && ImageFile.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + "-" + ImageFile.FileName;
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    ImageFile.CopyTo(stream);
                }
                todoTask.File = fileName;
            }


            _context.Add(todoTask);
            _context.SaveChanges();
            return RedirectToAction(nameof(Index));
        }

        //Update
        [HttpGet]
        public IActionResult Update(int id)
        {
            var todoTask = _context.TodoTasks.FirstOrDefault(t => t.Id == id);
            if (todoTask == null)
            {
                return View();
            }
            return View(todoTask);
        }

        [HttpPost]
        public IActionResult Update(TodoTask todoTask, IFormFile ImageFile)
        {
            //Update WWWroot
            var TaskInDb = _context.TodoTasks.AsNoTracking().FirstOrDefault(t => t.Id == todoTask.Id);
            if (ImageFile != null && ImageFile.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + "-" + ImageFile.FileName;
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    ImageFile.CopyTo(stream);
                }
                todoTask.File = fileName;

                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", TaskInDb.File);

                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }

            }
            else
            {
                todoTask.File = TaskInDb.File;
            }

            //Save DB
            _context.TodoTasks.Update(todoTask);
            _context.SaveChanges();
            return RedirectToAction(nameof(Index));

        }

        //Delete
        public IActionResult Delete(int id)
        {

            //Delete File
            var todoTask = _context.TodoTasks.FirstOrDefault(t => t.Id == id);
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", todoTask.File);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            //Delete DB
            _context.TodoTasks.Remove(todoTask);
            _context.SaveChanges();
            return RedirectToAction(nameof(Index));

        }
    }
}
