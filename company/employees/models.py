from django.db import models

class JobType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Employee(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    job_type = models.ForeignKey(JobType, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

