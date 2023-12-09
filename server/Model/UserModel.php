<?php
class UserModel extends Database
{
    public function getUsers($limit) 
    {
        return $this->select("SELECT * FROM customers ORDER BY customerNumber ASC LIMIT ?", ["i", $limit]);

    }
}
?>