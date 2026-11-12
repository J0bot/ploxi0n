# make test : compile et lance le test contre docs/protocole/vecteurs-v1.json (via test/vecteurs.h, régénéré par node tools/protocole/vecteurs-c.mjs)
CC ?= cc
CFLAGS ?= -std=c99 -Wall -Wextra -pedantic -O2
test: test/test.c maille.c maille.h test/vecteurs.h
	$(CC) $(CFLAGS) -I. maille.c test/test.c -o test/maille-test
	./test/maille-test
clean:
	rm -f test/maille-test
.PHONY: test clean
