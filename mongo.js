const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://pera:${password}@cluster0.pwwjpno.mongodb.net/personsApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const Person = mongoose.model("Person", phonebookSchema);

const person = new Person({
  name: name,
  number: number,
});

if (name && number)
  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook!`);
    mongoose.connection.close();
  });

if (!name && !number) {
  Person.find({}).then((result) => {
    console.log("Phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
