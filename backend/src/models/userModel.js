const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Il campo username è richiesto."],
    unique: [true, "Il campo username deve essere unico."],
  },
  email: {
    type: String,
    required: [true, "Il campo email è richiesto."],
    unique: [true, "Il campo email deve essere unico."],
    validate: [isEmail, "Inserisci un indirizzo email valido."],
  },
  password: {
    type: String,
    required: [true, "Il campo password è richiesto."],
  },
  privileges: {
    type: Number,
    default: 0,
  },
  //0 Utente base, 1 Amministratore
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

//  Middleware di Mongoose che serve a crittografare la password e
//  viene eseguito prima che l'utente venga salvato nel DB

userSchema.pre("save", async function (next) {
  // Se la password non è stata modificata,
  // non fare nulla e passa al prossimo middleware
  // In caso di modifica della password non la cripta nuovamente
  if (!this.isModified("password")) return next();

  // Se la password è stata modificata, cripta la password
  this.password = await bcrypt.hash(this.password, 10);

  // Procedi al prossimo middleware
  next();
});

// Metodo per confrontare la password inserita dall'utente con quella criptatqa (durante il login)
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
