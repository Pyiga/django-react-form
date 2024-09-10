# jobapp/admin.py

from django.contrib import admin
from .models import JobApplication, JobPosition, Education, Experience

admin.site.register(JobApplication)
admin.site.register(JobPosition)
admin.site.register(Education)
admin.site.register(Experience)
