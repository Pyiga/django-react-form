# jobapp/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, JobPositionViewSet, EducationViewSet, ExperienceViewSet

router = DefaultRouter()
router.register(r'job-applications', JobApplicationViewSet)
router.register(r'job-positions', JobPositionViewSet)
router.register(r'educations', EducationViewSet)
router.register(r'experiences', ExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
