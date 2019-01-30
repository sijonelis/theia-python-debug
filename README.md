# Theia java/js sample docker file with debug functionality

* By running this docker file you get a simple theia IDE with java debug support and java/python/js language servers.

* To launch simply clone the rep and run docker-compose up  

Sample Debug configuration for a java file: 

```java 
package asd;

class Test {
    public static void main(String[] args) {
        System.out.println("this");
        System.out.println("and this");
    }
}
```

is (configuration is added through top menu Debug->Add Configurations)

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug (Launch)-Test",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "console": "internalConsole",
      "stopOnEntry": false,
      "mainClass": "asd.Test",
      "args": ""
    }
  ]
}
```
