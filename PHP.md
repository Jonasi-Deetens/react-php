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

```

The '.' here means to add. So in this case our current directory '__DIR__' + "/../".

The "/../" parts makes it so that when you append that part, that it moves one lever up. So this will make it so "PROJECT_ROOT_PATH" is linked to the parent directory of the current directory.

Then we import all files needed, so we don't have to define them later inside of each model or controller or the index.

```php
require_once PROJECT_ROOT_PATH . "/inc/config.php";
require_once PROJECT_ROOT_PATH . "/Controller/Api/BaseController.php";
require_once PROJECT_ROOT_PATH . "/Controller/Api/UserController.php";
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
require_once PROJECT_ROOT_PATH . "/Model/UserModel.php";

```

This is why we don't have to import the Database.php in our UserModel class.

This is all for the 'inc' folder.

## Controller

As the word itself says, these are the classes that control the data that is asked from the api call and returns the data with the corresponding headers back.

We will add these to a folder call Api. This way we know these are the controllers that handle the api calls from the index.php

### BaseController.php

Just as the Database.php was for our models. This will be the class that will be extended by our other controllers which contains the structure for them.

First we will create a magic php method.

```php
    public function __call($name, $arguments)
    {
        $this->sendOutput('', array('HTTP/1.1 404 Not Found'));
    }

```

This is a magic method in PHP that gets invoked when invoking inaccessible methods in an object context. In this particular implementation, if a method is called on an instance of BaseController that doesn't exist, it will execute the sendOutput() method with an empty string as the data and a '404 Not Found' HTTP header.

Next we create a function 'getUriSegments()'.

```php
    protected function getUriSegments()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = explode("/", $uri);

        return $uri;
    }

```

This method retrieves segments of the URI by parsing $_SERVER['REQUEST_URI'], which contains the URI requested by the client. It uses parse_url() to get the path and explode() to split it into segments, returning an array containing the URI segments.

We also need a function to get all the parameters from the querys string of the url. (The part after '?')

```php
    protected function getQueryStringParams()
    {
        $queryString = isset($_SERVER["QUERY_STRING"]) ? $_SERVER["QUERY_STRING"] : '';
        parse_str($queryString, $query);
        return $query;
    }

```

This method retrieves query string parameters from the current request's URL. It uses $_SERVER["QUERY_STRING"] to get the query string and parse_str() to parse it into an associative array of parameters.

If the query string hasn't been defined we pass an empty string as value.

And for last we create a function that sends the output back, along with the correct headers it receives or the error headers if there is one.

```php
    protected function sendOutput($data, $httpHeaders = array())
    {
        header_remove('Set-Cookie');

        if (is_array($httpHeaders) && count($httpHeaders)) {
            foreach ($httpHeaders as $httpHeader){
                header($httpHeader);
            }
        }

        echo $data;
        exit;
    }

```

This method is responsible for sending the output to the client. It begins by removing any 'Set-Cookie' headers set previously. Then, it sets any provided HTTP headers using header(), followed by echoing the $data and exiting the script using exit.

Now that we have created the base functionality functions our controllers need. We can go ahead and create a UserController class.

### UserController.php

First of all we will extend our UserController with the BaseController class.

```php
class UserController extends BaseController
{
}

```

Now we need a function that gets called from the index.php after a api request has been sent from the user.

```php
    public function listAction()
    {
    }

```

We will reference this function later when a certain link has been requested.

There are a few things we need if we want to check what the user requested.

```php
        $strErrorDesc = "";
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

```
    
First we will define some variables to be used.

- $strErrorDesc = "" : An empty string which will be change depending on the error we get, if there is an error ofcourse.
- $requestMethod = $_SERVER["REQUEST_METHOD"] : We will check the server variable 'REQUEST_METHOD' to see if the api got a "POST" or a "GET" request. Depending on this we do a different fuction.
- $arrQueryStringParams = $this->getQueryStringParams() : We get the parameters from the query string, using the function of the 'BaseController' class.

Then we go and check if it's a GET request or not.

```php
        if (strtoupper($requestMethod) == "GET") {
            try {
                $userModel = new UserModel();
    
                $intLimit = 10;
                if (isset($arrQueryStringParams["limit"]) && $arrQueryStringParams["limit"]) {
                    $intLimit = $arrQueryStringParams["limit"];
                }
    
                $arrUsers = $userModel->getUsers($intLimit);
                $responseData = json_encode($arrUsers);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage().'Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = "Method not supported";
            $strErrorHeader = "HTTP/1.1 422 Unprocessable Entity";
        }

```

If it is a GET request:

- It creates an instance of the UserModel.
- It sets a default limit of 10 users ($intLimit = 10) and checks if the limit parameter exists in the query string. If it does, it updates $intLimit accordingly.
- Calls the getUsers() method from the UserModel, passing the limit, and stores the result in $arrUsers.
- Encodes $arrUsers into JSON format and assigns it to $responseData.
- If an exception occurs during the process (e.g., an error within the getUsers() method), it catches the exception and sets an error description along with an HTTP header for an internal server error (HTTP status code 500).

If not a GET:

- If the request method is not GET, it sets an error description indicating that the method is not supported along with an appropriate error header (HTTP status code 422).

Then we check if there is an error, and send the data back with the corresponding headers.

```php
        if (!$strErrorDesc) {
            $this->sendOutput($responseData, array("Content-Type: application/json", "HTTP/1.1 200 OK"));
        } else {
            $this->sendOutput(json_encode(array('error' => $strErrorDesc)),
                array('Content-Type: application/json', $strErrorHeader));
        }

```

- If there are no errors ($strErrorDesc is empty), it uses the sendOutput() method from the BaseController class to send the JSON-encoded response ($responseData) with a '200 OK' status header (HTTP/1.1 200 OK).
- If there are errors (non-empty $strErrorDesc), it constructs a JSON response with an error message and uses the sendOutput() method to send this error response.
It sends the error message in the format of {"error": "<error_description>"} along with an appropriate error header ($strErrorHeader), which was set in the previous conditional blocks depending on the encountered error.

Now everything has been setup to get the data and display it. We still need to define our index.php which calls upon these classes after our api gets a request.

## index.php

First thing here is importing all our configurations and settings.

```php
require __DIR__ . "/inc/bootstrap.php";

```

This is the file where all our imports are linked, and the 'PROJECT_ROOT_PATH' variable is defined.

The next part is setting up an access control header.

```php
header('Access-Control-Allow-Origin: http://localhost:3001');

```

This line sets the CORS header to allow requests from a specific origin (http://localhost:3001). CORS headers are used to control access to resources from different origins in web browsers.

Now we want to get the uri from the api call.

```php
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$uri = explode("/", $uri);

```
It parses the requested URI ($_SERVER["REQUEST_URI"]) and splits it into segments using the / delimiter. This helps in extracting different parts of the URI.

Then we check if it's a valid uri, or we have controllers set up for that uri.

In our case we want to check if there is a request to user/list to see if our listAction is getting called.

```php
if ((isset($uri[1]) && $uri[1] != "user") || !isset($uri[2])) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

```

This condition checks whether the URI contains specific segments:
- It checks if the second segment of the URI is not "user" or if the third segment is missing.
- If the condition is true, it sets the HTTP response status to '404 Not Found' and exits the script.

So if the api link is "localhost:8000/user/_something_" we send the third part to our controller.

In this case we only support "localhost:8000/user/list" since we have no other actions in our UserController.

```php
$objFeedController = new UserController();
$strMethodName = $uri[2] . 'Action';
$objFeedController->{$strMethodName}();

```

- It instantiates an UserController.
- Constructs the method name based on the third segment of the URI followed by 'Action'.
- Calls the corresponding method in the UserController based on the URI segment.

Once you get the hang of this layout, you can add controllers and models depending on your database structure. And change the index.php to handle uri requests to different controllers if needed.

To test if your api works. Enter the terminal and go to the location of the index.php.

Then use the command 

```
php -S localhost:8000

```

Now you can open your browser and go to:

http://localhost:8000/user/list?limit=20