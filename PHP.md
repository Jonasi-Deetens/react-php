# Setting up the PHP Server

In this file we will learn how to set up a restfull backend server with PHP where we get user data from a mysql database.

## Installing PHP on your pc

To install PHP you can go to (https://windows.php.net/download#php-8.3) and download the latest version.

After you've downloaded the .zip file, you can extract it into your C:/ folder. Or the main disk drive on your pc. Make sure the extracted folder is called php. This is necessary for linking extensions because the php.exe looks for a folder called "php".

Now add a new PATH environmental value on your system to the path of the php.exe on your pc.

In this case : "C:\php".
When this is done we can start creating a folder with the upcoming server structure.

## Server structure

- Controller
    - Api
        - BaseController.php
        - UserController.php
- inc
    - bootstrap.php
    - config.php
- Model
    - Database.php
    - UserModel.php
- index.php

We will start by explaining the "Model" folder.

## Model

This is the folder where we will create our classes that get the data from our database using Mysql. We will start by creating a class called Database. This will contain all functions that will be used by our model classes. (All the model classes will extend this class)

### Database.php

First of all we will create a protected variable 'connection'. This is the connection that we will call upon for executing statements.

```php
    protected $connection = null;

```

Ofcourse after creating our variable, we will initialize it in the constructor of our class.

```php
    public function __construct()
    {
        $this->connection = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE_NAME);

        if ( mysqli_connect_errno() ) {
            throw new Exception("Could not connect to database");
        }
    }
```

We are initializing a new mysql connection here by using the "new mysqli()" class which is a php extension.

We try our best to catch all errors possible, so add the if statement that checks is there is a connection error or not.

We will talk later about how we define those variables like 'DB_HOST' and 'DB_USERNAME'.

Next up we will create a function that will execute a query that it gets passed to.
We will make this a private function, because this will only be called by funtions inside this class.


```php
    private function executeStatement($query = "", $params = [])
    {
        try {
            $stmt = $this->connection->prepare($query);
            if ($stmt === false) {
                throw new Exception("Unable to do prepared statement: " . $query);
            }
    
            if ($params) {
                $stmt->bind_param($params[0], $params[1]);
            }
    
            $stmt->execute();
    
            return $stmt;
        } catch(Exception $e) {
            throw new Exception($e->getMessage());
        }
    }
```

This function needs to get a query that will it execute and some parameters to filter the query with.

- First we will let the database prepare our query. This will let it know what query we want the database to run.

- If the $stmt variable is false afterwards, it means it's an invalid query. So we check that first before we execute it.

- Then we will also add our parameters to our statement using the 'bind_param()' method.

- When this is done, we will execute our statement and return it.

When this is done we can add a public function that can be called outside this class, that runs the 'executeStatement' function with a certain query and some parameters.

In this case a select function.

```php
    public function select($query = "", $params = [])
    {
        $stmt = $this->executeStatement($query, $params);
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        return $result;
    }
```

This will run the select query that gets passed on to it from the model class that extends this Database.php structure class.

- First we will execute the 'executeStatement' function

- Then we will get the results from the statement using 'get_result()' method. This returns a set of data. Then we will convert that result set into an array using 'fetch_all'. We pass the 'MYSQLI_ASSOC' argument to specify that the fieldname should be the array index.

- After that we should always CLOSE our database connection. Otherwise this will give us conflict when preparing a new statement.

- And then we return the result back.

Now how is this implemented in our model ?

### UserModel.php

There is no need to import Database.php because we will link all our imports later, so we don't have to define them each time.

So first we extend the Database class.

```php
class UserModel extends Database
{
   
}

```

This will allow us to use the public functions defined in that Database class.

Then we want our model to handle the query we want to execute. In this case we create a function 'getUsers()' that will get all users from our database. We add an argument limit to it, which allows us to specify how many users we want to get.


```php
    public function getUsers($limit) 
    {
        return $this->select("SELECT * FROM customers ORDER BY customerNumber ASC LIMIT ?", ["i", $limit]);

    }

```

Here we will return the result we get from the select function, that executes the query with the parameters specified inside the 'executeStatement' function.

Keep in mind that we abstract that function by making it protected and using it in our Database class. This defines the structure of the functions that can be used by our models.

So how does php know the value of those variables like 'PROJECT_ROOT_PATH' or 'DB_USERNAME'? 

We will define those inside the 'inc' folder of our PHP structure.

## inc

Here we will define all our global path variables and link our imports (or requires in php) so that we don't have to import the classes in every php file all over again.

### config.php

In this file we will define all our global variables, which can not be made public. So we will add them to the gitignore file, so they don't get published onto oru github or other platforms.

This is done as simple as follows.

```php
define("DB_HOST", "localhost");
define("DB_USERNAME", "root");
define("DB_PASSWORD", "root");
define("DB_DATABASE_NAME", "classicmodels");

```

This is all we need to do to define those private global variables.

### bootstrap.php

Here we define our global PATH variable 'PROJECT_ROOT_PATH' and link our imports.

```php 
define("PROJECT_ROOT_PATH", __DIR__ . "/../");

require_once PROJECT_ROOT_PATH . "/inc/config.php";
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
require_once PROJECT_ROOT_PATH . "/Controller/Api/BaseController.php";
require_once PROJECT_ROOT_PATH . "/Controller/Api/EmployeeController.php";
require_once PROJECT_ROOT_PATH . "/Model/UserModel.php";
require_once PROJECT_ROOT_PATH . "/Model/EmployeeModel.php";


```

The '.' here means to add. So in this case our current directory '__DIR__' + "/../".

The "/../" parts makes it so that when you append that part, that it moves one lever up. So this will make it so "PROJECT_ROOT_PATH" is linked to the parent directory of the current directory.

Then we import all files needed, so we don't have to define them later inside of each model or controller or the index.

This is why we don't have to import the Database.php in our UserModel class.

This is all for the 'inc' folder.