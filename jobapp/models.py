# jobapp/models.py

from django.db import models

class JobPosition(models.Model):
    position = models.CharField(max_length=255)

    def __str__(self):
        return self.position

class Education(models.Model):
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    graduation_year = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.degree} from {self.institution}'

class Experience(models.Model):
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    responsibilities = models.TextField()

    def __str__(self):
        return f'{self.position} at {self.company}'

class CoverLetter(models.Model):
    file = models.FileField(upload_to='cover_letters/', blank=True, null=True)  # For file uploads
    text = models.TextField(blank=True, null=True)  # For plain text cover letters

    def __str__(self):
        return f"Cover Letter {self.id}"

class JobApplication(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    include_other_name = models.BooleanField(default=False)
    resume = models.FileField(upload_to='resumes/')
    cover_letters = models.ManyToManyField(CoverLetter, blank=True)  # Stores an array of cover letters

    job_positions = models.ManyToManyField(JobPosition, related_name='applications')
    education = models.ManyToManyField(Education, related_name='applications')
    experience = models.ManyToManyField(Experience, related_name='applications')

    def __str__(self):
        return f'{self.first_name} {self.last_name}'
