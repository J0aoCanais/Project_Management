# Contacts API Documentation

This document provides comprehensive technical documentation for the Contacts API endpoints, built with Flask, SQLAlchemy, and Marshmallow validation.

---

## Overview

The Contacts API allows authenticated owners to retrieve, create, and search for contact records. All responses are returned in JSON format.

---

## Endpoints

### 1. Get All Contacts

Retrieves a list of all contacts.

* **URL:** `/`


* **Method:** `GET`


* **Authentication/Security:** Protected by `@owner_required`


* **Success Response:**
* **Code:** `200 OK`


* **Content:** A JSON array of contact objects matching the `ContactResponseSchema`.





---

### 2. Create a Contact

Creates a new contact record.

* **URL:** `/add`


* **Method:** `POST`


* **Content-Type:** `application/json`
* Request Body Schema (`ContactCreateSchema`):


* `name` (string, **Required**): Length between 1 and 512 characters.


* `type` (string, **Required**): Length between 1 and 512 characters.


* `email` (string/email, *Optional*): Valid email address.


* `phone_number` (string, *Optional*)


* `address` (string, *Optional*)


* `company_name` (string, *Optional*)


* `zone` (string, *Optional*)


* `notes` (string, *Optional*)


* `nif` (string, *Optional*)


* `consent_given` (boolean, *Optional*)


* `consent_date` (datetime, *Optional*)


* `consent_channel` (string, *Optional*)




* **Success Response:**
* **Code:** `201 Created`


* **Content:** The newly created contact object.


* **Error Responses:**
* **Code:** `400 Bad Request`


* **Content:** Validation errors returned by Marshmallow.


```json
{
  "errors": {
    "field_name": ["Error message description"]
  }
}

```




* **Code:** `500 Internal Server Error`


* **Content:** Triggered on unexpected server exceptions (triggers a database rollback).


```json
{
  "error": "Internal server error"
}

```







---

### 3. Search Contacts

Searches for contacts across multiple fields (`name`, `email`, `phone_number`, `nif`) with pagination support.

* **URL:** `/search`


* **Method:** `GET`


* Query Parameters (`ContactSearchSchema`):


* `q` (string, **Required**): Search query string. Must contain at least 2 characters (maximum 512 characters).


* `page` (integer, *Optional*): Page number for pagination (defaults to `1`, minimum `1`).


* `per_page` (integer, *Optional*): Number of results per page (defaults to `20`, range `1` to `100`).




* **Success Response:**
* **Code:** `200 OK`


* **Content:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Example Name",
      "type": "Client",
      "email": "example@example.com",
      "phone_number": "123456789",
      "address": "123 Street",
      "company_name": "Company Ltd",
      "zone": "North",
      "notes": "Some notes",
      "nif": "123456789",
      "consent_given": true,
      "consent_date": "2026-01-01T00:00:00",
      "consent_channel": "Web"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}

```




* **Error Responses:**
* **Code:** `400 Bad Request`


* **Content (Short Search Term):**


```json
{
  "error": "Search term must contain at least 2 characters"
}

```


* **Content (Invalid Parameters / Validation Error):**


```json
{
  "error": "Invalid search parameters"
}

```