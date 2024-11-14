from rest_framework import serializers
from .models import Employee, JobType, Department

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

