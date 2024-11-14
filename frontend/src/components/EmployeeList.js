import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeList.css';
import './ScrollToTopButton.css';
import './export.css';
import DatePicker from 'react-datepicker'; // Импортируем DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Импортируем стили для DatePicker

import FilterComp from './FilterComp';
import ExportToWord from './ExportToWord';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import { utils, writeFile } from 'xlsx';
import { saveAs } from 'file-saver';
const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Состояние для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [editedEmployee, setEditedEmployee] = useState({
        first_name: '',
        last_name: '',
        salary: '',
        job_type: '',
        department: ''
    });

    const [editedJobType, setEditedJobType] = useState({});
    const [editedDepartment, setEditedDepartment] = useState({});
    
    const [isEditJobTypeModalOpen, setIsEditJobTypeModalOpen] = useState(false);
    const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false);

    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        salary: '',
        job_type: '',
        department: '',
    });
    const [newJobType, setNewJobType] = useState({
        name: '',
    });
    const [newDepartment, setNewDepartment] = useState({
        name: '' });
    
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const handleSelectEmployee = (employee) => {
        setSelectedEmployees(prevSelected => {
            if (prevSelected.includes(employee)) {
                return prevSelected.filter(emp => emp !== employee); // Убираем, если уже выбран
            } else {
                return [...prevSelected, employee]; // Добавляем, если не выбран
            }
        });
    };

    const [vacationStartDates, setVacationStartDates] = useState({});
    const [vacationEndDates, setVacationEndDates] = useState({});

    // Обработчики изменений дат начала и окончания отпуска
    const handleStartDateChange = (employeeId, date) => {
        setVacationStartDates(prev => ({ ...prev, [employeeId]: date }));
        console.log(`Start date for employee ${employeeId}:`, date); // Debugging log
    };
    
    const handleEndDateChange = (employeeId, date) => {
        setVacationEndDates(prev => ({ ...prev, [employeeId]: date }));
        console.log(`End date for employee ${employeeId}:`, date); // Debugging log
    };

        // Новая функция для экспорта в docx
    const handleExportEmployees = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: 'Employee List',
                            heading: 'Title',
                        }),
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph('First Name')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Last Name')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Salary')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Job Type')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Department')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                    ]
                                }),
                                ...employees.map(emp => 
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                children: [new Paragraph(emp.first_name || '')]
                                            }),
                                            new TableCell({
                                                children: [new Paragraph(emp.last_name || '')]
                                            }),
                                            new TableCell({
                                                children: [new Paragraph(emp.salary?.toString() || '')]
                                            }),
                                            new TableCell({
                                                children: [
                                                    new Paragraph(
                                                        jobTypes.find(job => job.id === emp.job_type)?.name || 'Unknown Job Type'
                                                    )
                                                ]
                                            }),
                                            new TableCell({
                                                children: [
                                                    new Paragraph(
                                                        departments.find(dept => dept.id === emp.department)?.name || 'Unknown Department'
                                                    )
                                                ]
                                            }),
                                        ]
                                    })
                                )
                            ]
                        })
                    ]
                }
            ]
        });
    
        // Генерация файла и скачивание
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'employees.docx');
        });
    };
    

    const handleExportJobTypes = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: 'JobType List',
                            heading: 'Title',
                        }),
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph('Name')],
                                            width: { size: 25, type: WidthType.PERCENTAGE }
                                        }),
                                    ]
                                }),
                                ...jobTypes.map(emp => 
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                children: [new Paragraph(emp.name)]
                                            }),
                                        ]
                                    })
                                )
                            ]
                        })
                    ]
                }
            ]
        });

          // Генерация файла и скачивание
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'jobtypes.docx');
        });
    };

    //экспорт эксель
    const handleExportEmployeesToExcel = () => {
        // Формируем данные для Excel
        const employeeData = employees.map(emp => ({
            "First Name": emp.first_name || '',
            "Last Name": emp.last_name || '',
            "Salary": emp.salary?.toString() || '',
            "Job Type": jobTypes.find(job => job.id === emp.job_type)?.name || 'Unknown Job Type',
            "Department": departments.find(dept => dept.id === emp.department)?.name || 'Unknown Department',
        }));
    
        // Создаем рабочий лист
        const worksheet = utils.json_to_sheet(employeeData);
    
        // Создаем рабочую книгу
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Employees");
    
        // Генерация и скачивание файла
        writeFile(workbook, 'employees.xlsx');
    };

    const handleExportJobTypesToExcel = () => {
        // Формируем данные для Excel
        const jobTypeData = jobTypes.map(jobType => ({
            "Job Type Name": jobType.name
        }));
    
        // Создаем рабочий лист
        const worksheet = utils.json_to_sheet(jobTypeData);
    
        // Создаем рабочую книгу
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Job Types");
    
        // Генерация и скачивание файла
        writeFile(workbook, 'jobtypes.xlsx');
    };
    

    useEffect(() => {
        // Запрос к API на Django для получения списка сотрудников
        axios.get('http://localhost:8000/api/employees/')
            .then(res => {
                setEmployees(res.data);
            })
            .catch(err => {
                console.error(err);
            });

        // Запрос к API для получения списка типов работы
        axios.get('http://localhost:8000/api/job-types/')
            .then(res => {
                setJobTypes(res.data);
            })
            .catch(err => {
                console.error(err);
            });

         // Получение данных отделов
        axios.get('http://localhost:8000/api/departments/')
            .then(res => {
                setDepartments(res.data);
            })
            .catch(err => {
                console.error(err);
            });

    }, []);

    // Функция для удаления сотрудника
    const handleDeleteEmployee = (id) => {
        axios.delete(`http://localhost:8000/api/employees/${id}/`)
            .then(() => {
                setEmployees(employees.filter(employee => employee.id !== id));
            })
            .catch(err => {
                console.error(err);
            });
    };

    // Функция для добавления нового сотрудника
    const handleAddEmployee = (e) => {
        e.preventDefault();
    
        if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.salary || !newEmployee.job_type) {
            console.error('All fields are required');
            return;
        }
    
        axios.post('http://localhost:8000/api/employees/', newEmployee)
            .then((res) => {
                setEmployees([...employees, res.data]);
                setNewEmployee({ first_name: '', last_name: '', salary: '', job_type: '', department: '' });
                
            })
            .catch(err => {
                console.error(err.response.data);
                
            });
    };
    

    // Функция для добавления нового типа работы
    const handleAddJobType = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8000/api/job-types/', newJobType)
            .then((res) => {
                setJobTypes([...jobTypes, res.data]); // Обновляем список типов работы
                setNewJobType({ name: '' }); // Очищаем поля ввода
            })
            .catch(err => {
                console.error(err);
            });
    };

    // Функция для удаления типа работы
    const handleDeleteJobType = (id) => {
        axios.delete(`http://localhost:8000/api/job-types/${id}/`)
            .then(() => {
                setJobTypes(jobTypes.filter(jobType => jobType.id !== id));
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleAddDepartment = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/departments/', newDepartment)
            .then((res) => {
                setDepartments([...departments, res.data]); // Обновляем список отделов
                setNewDepartment({ name: '' }); // Очищаем поля ввода
            })
            .catch(err => {
                console.error(err);
            });
    };
    
    const handleDeleteDepartment = (id) => {
        axios.delete(`http://localhost:8000/api/departments/${id}/`)
            .then(() => {
                setDepartments(departments.filter(department => department.id !== id));
            })
            .catch(err => {
                console.error(err);
            });
    };

    // Открытие модального окна для редактирования сотрудников
    const handleEditEmployee = (id) => {
        const employee = employees.find(emp => emp.id === id);
        if (employee) {
            setEmployeeToEdit(employee);
            setEditedEmployee({
                first_name: employee.first_name,
                last_name: employee.last_name,
                salary: employee.salary,
                job_type: employee.job_type,
                department: employee.department
            });
            setIsModalOpen(true);
        }
    };

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setEmployeeToEdit(null);
    };

    // Обновление данных сотрудника при изменении в модальной форме
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEmployee({
            ...editedEmployee,
            [name]: value
        });
    };

    // Сохранение изменений сотрудника
    const handleSaveChanges = () => {
        axios.put(`http://localhost:8000/api/employees/${employeeToEdit.id}/`, editedEmployee)
            .then(() => {
                // Обновляем список сотрудников
                setEmployees(employees.map(emp => emp.id === employeeToEdit.id ? editedEmployee : emp));
                closeModal();
            })
            .catch(err => {
                console.error(err);
            });
    };

    // Открытие модального окна для редактирования типа работы
    const handleEditJobType = (id) => {
        const jobType = jobTypes.find(jobType => jobType.id === id);
        if (jobType) {
            setEditedJobType(jobType); 
            setIsEditJobTypeModalOpen(true);
        }
    }; 

    // Закрытие модального окна для редактирования типа работы
    const closeEditJobTypeModal = () => {
        setIsEditJobTypeModalOpen(false); // Закрываем модальное окно
        setEditedJobType({}); // Сбрасываем редактируемый тип работы
    };

    // Сохранение изменений типа работы
    const handleEditJobTypeSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:8000/api/job-types/${editedJobType.id}/`, {
            name: editedJobType.name,
        })
        .then((response) => {
            const updatedJobType = response.data; // Получаем обновленный тип работы из ответа сервера
            setJobTypes((prevJobTypes) =>
                prevJobTypes.map((jobType) =>
                    jobType.id === updatedJobType.id ? updatedJobType : jobType
                )
            );

            closeEditJobTypeModal(); // Закрытие модального окна
        })
        .catch((error) => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при обновлении типа работы: ' + (error.response?.data?.message || error.message));
        });
    };
    

    // Открытие модального окна для редактирования отдела
    const handleEditDepartment = (id) => {
        const department = departments.find(dep => dep.id === id);
        if (department) {
            setEditedDepartment(department);
            setIsEditDepartmentModalOpen(true); // Открываем модальное окно
        }
    };

    // Закрытие модального окна для редактирования отдела
    const closeEditDepartmentModal = () => {
        setIsEditDepartmentModalOpen(false); // Закрываем модальное окно
        setEditedDepartment({}); // Сбрасываем редактируемый отдел
    };

    // Обновление отдела
    const handleEditDepartmentSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:8000/api/departments/${editedDepartment.id}/`, {
            name: editedDepartment.name,
        })
        .then((response) => {
            const updatedDepartment = response.data; // Получаем обновленный отдел из ответа сервера
            setDepartments((prevDepartments) =>
                prevDepartments.map((dep) =>
                    dep.id === updatedDepartment.id ? updatedDepartment : dep
                )
            );

            closeEditDepartmentModal(); // Закрытие модального окна
        })
        .catch((error) => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при обновлении отдела: ' + (error.response?.data?.message || error.message));
        });
    };

    //скролл вверх
    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавная прокрутка
        });
    };
        
    return (
        <div>
            {/* Хедер с навигацией */}
            <header className="header">
                <div className="cube">
                    <div className="side front"></div>
                    <div className="side back"></div>
                    <div className="side left"></div>
                    <div className="side right"></div>
                    <div className="side top"></div>
                    <div className="side bottom"></div>
                </div>
                <h1>Employee Management System</h1>
                <nav>
                    <ul>
                        <li><a href="#add-employee">Add Employee</a></li>
                        <li><a href="#add-job-type">Add Job Type</a></li>
                        <li><a href="#add-department">Add Department</a></li>
                    </ul>
                </nav>
            </header>

            <main>
                {/* Форма для добавления нового сотрудника */}
                <form onSubmit={handleAddEmployee} className="employee-form" id="add-employee">

                    <h2>Add New Employee</h2>

                    <div className="input-field-container">
                        <input
                            type="text"
                            className="input-field"
                            placeholder=" "
                            value={newEmployee.first_name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                            required
                            id="first-name"
                        />
                        <label className="label" htmlFor="first-name">First Name</label>
                    </div>

                    <div className="input-field-container">
                        <input
                            type="text"
                            className="input-field"
                            placeholder=" "
                            value={newEmployee.last_name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                            required
                            id="last-name"
                        />
                        <label className="label" htmlFor="last-name">Last Name</label>
                    </div>

                    <div className="input-field-container">
                        <input
                            type="number"
                            className="input-field"
                            placeholder=" "
                            value={newEmployee.salary}
                            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                            required
                            id="salary"
                        />
                        <label className="label" htmlFor="salary">Salary</label>
                    </div>

                    <div className="input-field-container">
                        <select
                            className="select-field"
                            value={newEmployee.job_type}
                            onChange={(e) => setNewEmployee({ ...newEmployee, job_type: e.target.value })}
                            required
                        >
                            <option value="" disabled hidden>Select Job Type</option>
                            {jobTypes.map(jobType => (
                                <option key={jobType.id} value={jobType.id}>{jobType.name}</option>
                            ))}
                        </select>
                        <label className="label" htmlFor="job-type">Job Type</label>
                    </div>

                    <div className="input-field-container">
                        <select
                            className="select-field"
                            value={newEmployee.department}
                            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                            required
                        >
                            <option value="" disabled hidden>Select Department</option>
                            {departments.map(department => (
                                <option key={department.id} value={department.id}>{department.name}</option>
                            ))}
                        </select>
                        <label className="label" htmlFor="department">Department</label>
                    </div>

                    <button type="submit" className="export-button">Add Employee</button>
                </form>
                
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Edit Employee</h2>
                            <form onSubmit={handleSaveChanges}>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={editedEmployee.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={editedEmployee.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="number"
                                    name="salary"
                                    placeholder="Salary"
                                    value={editedEmployee.salary}
                                    onChange={handleInputChange}
                                    required
                                />
                                <select
                                    name="job_type"
                                    value={editedEmployee.job_type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Job Type</option>
                                    {jobTypes.map(jobType => (
                                        <option key={jobType.id} value={jobType.id}>
                                            {jobType.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="department"
                                    value={editedEmployee.department}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={closeModal}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Таблица сотрудников */}
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Salary</th>
                            <th>Job Type</th>
                            <th>Department</th> {/* Новый столбец для отдела */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee => (
                            <tr key={employee.id}>
                                <td>{employee.first_name}</td>
                                <td>{employee.last_name}</td>
                                <td>{employee.salary}</td>
                                <td>
                                    {jobTypes.find(job => job.id === employee.job_type)?.name || 'Unknown Job Type'}
                                </td>
                                <td>
                                    {departments.find(dept => dept.id === employee.department)?.name || 'Unknown Department'}
                                </td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditEmployee(employee.id)}> {/* Добавлено для редактирования */}
                                        <span role="img" aria-label="Редактировать">✏️</span>
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteEmployee(employee.id)}>
                                        <span role="img" aria-label="Удалить">🗑️</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                {/* Форма для добавления нового типа работы */}
                <form onSubmit={handleAddJobType} className="job-type-form" id="add-job-type">
                    <h2>Add New Job Type</h2>

                    <div className="input-field-container">
                        <input
                            type="text"
                            className="input-field" // Добавьте класс для стилей
                            placeholder=" " // Оставьте пробел для использования метки
                            value={newJobType.name}
                            onChange={(e) => setNewJobType({ name: e.target.value })}
                            required
                            id="job-type-name" // Уникальный ID для метки
                        />
                        <label className="label" htmlFor="job-type-name">Job Type Name</label> {/* Добавьте метку */}

                        <button className="export-button" type="submit">Add Job Type</button>
                    </div>
                    
                </form>


                {/* Модальное окно для редактирования типа работы */}
                {isEditJobTypeModalOpen && (
                    <div className="modal" >
                        <form onSubmit={handleEditJobTypeSubmit}>
                            <h2>Редактировать тип работы</h2>

                            <div className="input-field-container">
                                <input 
                                    type="text" 
                                    className="input-field"
                                    value={editedJobType.name || ''} 
                                    onChange={(e) => setEditedJobType({ ...editedJobType, name: e.target.value })} 
                                    placeholder="Имя типа работы" 
                                />
                                <button class="export-button" type="submit">Сохранить изменения</button>
                                <button class="export-button" type="button" onClick={closeEditJobTypeModal}>Закрыть</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Таблица типов работ */}
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Job Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobTypes.map(jobType => (
                            <tr key={jobType.id}>
                                <td>{jobType.name}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditJobType(jobType.id)}>
                                        <span role="img" aria-label="Редактировать">✏️</span>
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteJobType(jobType.id)}>
                                        <span role="img" aria-label="Удалить">🗑️</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <form onSubmit={handleAddDepartment} className="department-form" id="add-department">
                    <h2>Add New Department</h2>

                    <div className="input-field-container">
                        <input
                            type="text"
                            className="input-field"
                            placeholder=" "
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment({ name: e.target.value })}
                            required
                        />
                        <label className="label" htmlFor="job-type-name">Department Name</label>

                        <button class="export-button" type="submit">Add Department</button>
                    </div>
                </form>

                 {/* Модальное окно для редактирования отдела */}
                {isEditDepartmentModalOpen && (
                    <div className="modal">
                        <form onSubmit={handleEditDepartmentSubmit}>
                            <h2>Редактировать отдел</h2>

                            <div className="input-field-container">
                                <input 
                                    type="text" 
                                    className="input-field"
                                    value={editedDepartment.name} 
                                    onChange={(e) => setEditedDepartment({ ...editedDepartment, name: e.target.value })} 
                                    placeholder="Имя отдела" 
                                />
                                <button class="export-button" type="submit">Сохранить изменения</button>
                                <button class="export-button" type="button" onClick={closeEditDepartmentModal}>Закрыть</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Таблица отдела работ */}
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(department => (
                            <tr key={department.id}>
                                <td>{department.name}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditDepartment(department.id)}> {/* Добавлено для редактирования */}
                                        <span role="img" aria-label="Редактировать">✏️</span>
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteDepartment(department.id)}>
                                        <span role="img" aria-label="Удалить">🗑️</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                <div className="export-buttons">
                    <button className="export-button" onClick={handleExportEmployeesToExcel}>
                        Export Employees to Excel
                    </button>

                    <button className="export-button" onClick={handleExportJobTypesToExcel}>
                        Export Job Types to Excel
                    </button>

                    <button className="export-button" onClick={handleExportEmployees}>Export Employees to Text File</button>
                    <button className="export-button" onClick={handleExportJobTypes}>Export Job Types to Text File</button>
                </div>
            </main>

            <button className="scroll-to-top" onClick={handleScrollToTop}>
                <span role="img" aria-label="вверх">⬆️</span>
            </button>

            <FilterComp employees={employees} jobTypes={jobTypes} departments={departments} />

            <div>
                {/* экспорт в файл */}
                <ExportToWord
                    selectedEmployees={selectedEmployees}
                    vacationStartDates={vacationStartDates}
                    vacationEndDates={vacationEndDates}
                    employees={employees}
                    handleSelectEmployee={handleSelectEmployee} // Передайте функции для обработки выбора
                    handleStartDateChange={handleStartDateChange}
                    handleEndDateChange={handleEndDateChange}
                />
            </div>

            {/* Футер */}
            <footer className="footer">
                <p>© 2024 авторский проект Employee Management System</p>
            </footer>
        </div>
    );
}

export default EmployeeList;
