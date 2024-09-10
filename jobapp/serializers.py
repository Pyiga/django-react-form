# jobapp/serializers.py

from rest_framework import serializers
from .models import JobPosition, Education, Experience, JobApplication

class JobPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosition
        fields = ['id', 'position']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'graduation_year']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'position', 'start_date', 'end_date', 'responsibilities']

class JobApplicationSerializer(serializers.ModelSerializer):
    job_positions = JobPositionSerializer(many=True)
    education = EducationSerializer(many=True)
    experience = ExperienceSerializer(many=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'first_name', 'last_name', 'other_name', 'email', 'phone',
                  'include_other_name', 'resume', 'cover_letters', 'job_positions',
                  'education', 'experience']

    def create(self, validated_data):
        job_positions_data = validated_data.pop('job_positions')
        education_data = validated_data.pop('education')
        experience_data = validated_data.pop('experience')

        job_application = JobApplication.objects.create(**validated_data)

        for position_data in job_positions_data:
            position, _ = JobPosition.objects.get_or_create(**position_data)
            job_application.job_positions.add(position)

        for education_item in education_data:
            education, _ = Education.objects.get_or_create(**education_item)
            job_application.education.add(education)

        for experience_item in experience_data:
            experience, _ = Experience.objects.get_or_create(**experience_item)
            job_application.experience.add(experience)

        return job_application
