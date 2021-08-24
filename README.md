# practice-website
A site I built to practice vulnerability and understand server structure

The site itself contains the following pages:
Registration
Login
Log Out
A page where you can enter your favorite food and output has two options
1. Reflection on the user's page - Dom xss using innerHTML (which I protected)
2. Add the answer to the database and redirect to another page that contains a record of all the users and their favorite food.
This page also has input that allows you to change the food name of the user you are connected to.



I protected SQL injections using the fact that the variable entered in the query is an external variable (express.js provides protection)
I also set the sameSite = lax and added a csrf token created by csrf Cookie





