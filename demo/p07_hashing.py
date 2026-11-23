import hashlib
import time

from pwdlib import PasswordHash

password = "correct horse battery staple"
hasher = PasswordHash.recommended()  # Argon2id with sane default parameters

# 1. The fast hash: what a leaked table looks like when someone "just used sha256".
fast = hashlib.sha256(password.encode()).hexdigest()
print("sha256        :", fast)
print("same input    :", hashlib.sha256(password.encode()).hexdigest() == fast)

# 2. The password hash: salted, slow on purpose, parameters stored inside the string.
first = hasher.hash(password)
second = hasher.hash(password)
print("argon2 #1     :", first)
print("argon2 #2     :", second)
print("same input    :", first == second)
print("verify right  :", hasher.verify(password, first))
print("verify wrong  :", hasher.verify("hunter2", first))

# 3. Why slow matters: what one guess costs the attacker.
guesses = 200_000
started = time.perf_counter()
for i in range(guesses):
    hashlib.sha256(f"guess{i}".encode()).digest()
sha_per_guess = (time.perf_counter() - started) / guesses

started = time.perf_counter()
hasher.verify("guess", first)
argon_per_guess = time.perf_counter() - started

print(f"sha256 guess  : {sha_per_guess * 1e6:.2f} microseconds")
print(f"argon2 guess  : {argon_per_guess * 1e3:.1f} milliseconds")
print(f"ratio         : about {argon_per_guess / sha_per_guess:,.0f}x slower per guess")
