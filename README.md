# lisp.js
*lisp.js* ist ein vereinfachter LISP-Interpreter der in Javascript geschrieben wurde.
Dies ist Teil einer Projektarbeit des Moduls *Theoretische Informatik* an der *FFHS*.

## Funktionalität

### Grundlegende Operatoren
```lisp
(+ 3 5 1)
(- 1 4 2)
(* 2 3 1)
(/ 6 2)
```

### Verzweigungen
```lisp
(if (+ 1 2)
  (+ 2 4)
  (- 2 4))
```

### Variablen
```lisp
(let x 3)
(let y 4)
(+ x y)
```

### Funktionen
```lisp
(defun add (x y)
  (+ x y))
(add 1 3)
```

## Ausführen
Um den Interpreter zu starten muss nur die Datei ```index.html``` im Browser ausgeführt werden.
