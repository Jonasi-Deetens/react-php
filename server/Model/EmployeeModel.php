<?php
class EmployeeModel extends Database
{
    public function getEmployees($limit)
    {
        return $this->select("SELECT * FROM employees ORDER BY employeeNumber ASC LIMIT ?", ["i", $limit]);
    }
}
?>
