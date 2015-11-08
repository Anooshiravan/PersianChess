package main

import "fmt"

func main() {

	PrintBoard()
}

func debuglog(str string) {
	fmt.Println(str)
}

func contains(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
