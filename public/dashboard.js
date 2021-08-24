const express = require('express')
    function addname() {
    //var name = document.getElementById("name").value;
    var food = document.getElementById("food").value;
    document.getElementById("message").innerHTML = " your favorite food is "+food.replace(/\</g, '&lt;'); 
}                              //.replace(/\</g -->  Replaces the tags for their encoding and treats all tags as strings

function Redirect() {
    window.location = "http://localhost:4000/allfoods";
 }