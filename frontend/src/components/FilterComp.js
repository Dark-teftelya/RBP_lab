import React, { useState } from 'react';
import './FilterComp.css';
const FilterComp = ({ employees, jobTypes, departments }) => {
    const [filteredEmployees, setFilteredEmployees] = useState(employees);
    const [selectedJobTypes, setSelectedJobTypes] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNoneSelected, setIsNoneSelected] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Обработка выбора флажков для типа работы
    const handleJobTypeChange = (e) => {
        const { value, checked } = e.target;
        setSelectedJobTypes(prevState =>
            checked ? [...prevState, value] : prevState.filter(id => id !== value)
        );
    };

    // Обработка выбора флажков для отдела
    const handleDepartmentChange = (e) => {
        const { value, checked } = e.target;
        setSelectedDepartments(prevState =>
            checked ? [...prevState, value] : prevState.filter(id => id !== value)
        );
    };

    // Обработка флажка None (очистка фильтров)
    const handleNoneChange = (e) => {
        const { checked } = e.target;
        setIsNoneSelected(checked);
    };

    // Обработка ввода поискового запроса
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Очистка всех фильтров, поля поиска и таблицы
    const handleReset = () => {
        setSelectedJobTypes([]);
        setSelectedDepartments([]);
        setSearchQuery('');
        setFilteredEmployees([]);
        setIsNoneSelected(false);
        setErrorMessage('');
    };

    // Обработка нажатия на кнопку поиска
    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const filtered = employees.filter(emp => {
            const jobTypeName = jobTypes.find(job => job.id === emp.job_type)?.name || '';
            const departmentName = departments.find(dept => dept.id === emp.department)?.name || '';
            const searchQueryLower = searchQuery.toLowerCase();

            // Приведение фамилии к нижнему регистру для поиска
            const firstNameLower = emp.first_name ? emp.first_name.toLowerCase() : '';

            return (
                firstNameLower.includes(searchQueryLower) ||
                jobTypeName.toLowerCase().includes(searchQueryLower) ||
                departmentName.toLowerCase().includes(searchQueryLower)
            );
        });

        if (filtered.length === 0) {
            setErrorMessage('Данные не найдены. Проверьте правильность ввода.');
        } else {
            setErrorMessage('');
        }

        setFilteredEmployees(filtered);
    };

    // Обработка нажатия на кнопку фильтрации
    const handleFilterSubmit = (e) => {
        e.preventDefault();

        if (isNoneSelected) {
            // Очищаем таблицу
            setFilteredEmployees([]);
            setErrorMessage('');
        } else {
            const filtered = employees.filter(emp => {
                const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(emp.job_type.toString());
                const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(emp.department.toString());
                return matchesJobType && matchesDepartment;
            });

            setFilteredEmployees(filtered);
            setErrorMessage('');
        }
    };

    return (
        <div className="filter-comp">
            <form onSubmit={handleFilterSubmit}>
                <h3>Filter Employees</h3>

                <div className="input-field-container">
                    {/* Поле поиска */}
                    <input
                        type="text"
                        className="input-field"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Поиск"
                    />
                    <button type="button" onClick={handleSearchSubmit}>
                        Поиск
                    </button>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="checkbox-group">
                    <div>
                        <h4>Job Types</h4>
                        {jobTypes.map(jobType => (
                            <div key={jobType.id}>
                                <input
                                    type="checkbox"
                                    id={`jobType-${jobType.id}`}
                                    value={jobType.id}
                                    checked={selectedJobTypes.includes(jobType.id.toString())}
                                    onChange={handleJobTypeChange}
                                />
                                <label htmlFor={`jobType-${jobType.id}`}>{jobType.name}</label>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h4>Departments</h4>
                        {departments.map(dept => (
                            <div key={dept.id}>
                                <input
                                    type="checkbox"
                                    id={`dept-${dept.id}`}
                                    value={dept.id}
                                    checked={selectedDepartments.includes(dept.id.toString())}
                                    onChange={handleDepartmentChange}
                                />
                                <label htmlFor={`dept-${dept.id}`}>{dept.name}</label>
                            </div>
                        ))}
                    </div>

                    <div>
                        <input
                            type="checkbox"
                            id="resetFilters"
                            checked={isNoneSelected}
                            onChange={handleNoneChange}
                        />
                        <label htmlFor="resetFilters">None (Clear Filters)</label>
                    </div>
                </div>

                <button type="submit">Применить фильтры</button>
            </form>

            {/* Кнопка сброса */}
            <button className="reset-button" onClick={handleReset}>
                Сбросить все
            </button>

            {/* Таблица сотрудников */}
            <EmployeeTable employees={filteredEmployees} jobTypes={jobTypes} departments={departments} />
        </div>
    );
};

// Компонент таблицы для отображения сотрудников
const EmployeeTable = ({ employees, jobTypes, departments }) => {
    return (
        <table className="styled-table">
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Salary</th>
                    <th>Job Type</th>
                    <th>Department</th>
                </tr>
            </thead>
            <tbody>
                {employees.map(emp => (
                    <tr key={emp.id}>
                        <td>{emp.first_name}</td>
                        <td>{emp.last_name}</td>
                        <td>{emp.salary}</td>
                        <td>{jobTypes.find(job => job.id === emp.job_type)?.name || 'Unknown Job Type'}</td>
                        <td>{departments.find(dept => dept.id === emp.department)?.name || 'Unknown Department'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default FilterComp;
