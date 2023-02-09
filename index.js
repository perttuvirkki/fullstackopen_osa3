const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Contact = require("./models/contact")
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("build"))

morgan.token("postData", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body)
  }

  return undefined
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :postData"))

app.get("/info", (req, res) => {
  Contact.find({}).then(contacts => {
    const message = `<p>Phonebook has info for ${contacts.length} people</p><p>${new Date()}</p>`
    res.send(message)
  })
})

app.get("/api/persons", (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get("/api/persons/:id", (request, response) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: "Malformatted id" })
    })
})

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const newContact = request.body
  if (!("name" in newContact)) {
    response.status(400).end("The contact has to have a name")
    return
  }
  if (!("number" in newContact)) {
    response.status(400).end("The contact has to have a number")
    return
  }

  const id = Math.floor(Math.random() * 10000000)
  const contact = new Contact({
    id: id,
    name: newContact.name,
    number: newContact.number,
  })

  contact.save().then((r) => {
    console.log(contact)
    response.status(200).json(r)
  }).catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const contact = {
    name: request.body.name,
    number: request.body.number
  }

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" })
  }
  else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})