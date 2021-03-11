package server

import (
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"

	echo "github.com/labstack/echo/v4"
)

// EP type that will hold an initialized instance of all endpoints
type EP struct {
	//db *pg.DB
	userNotifiers *sync.Map
	client        *http.Client
}

// LessonLearned defines a LessonLearned
type LessonLearned struct{
	Author string `json:"author"`
	Title string `json:"title"`
	Content string `json:"content"`
}

// BuildEP will return an initialized EP structure given the set parameters
func BuildEP() *EP {
	log.Println("Building endpoints...")
	return &EP{
		userNotifiers: &sync.Map{},
		//db:            DB,
		client: &http.Client{Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}},
	}
}

//
//
// TODO - Figure out how to provide .env toggle for mock on server or interact with DB.
//
//
//LessonsLearnedPut stores a lesson learned in the database
func (e *EP) LessonsLearnedPut(ctx echo.Context) error {
	lesson := &LessonLearned{}
	ctx.Bind(&lesson)
	fmt.Println("Putting ", lesson, " into DB");
	return ctx.JSON(http.StatusOK, "OK")
}

//AirspaceListGet returns data for all airspaces
// SELECT * FROM AIRSPACELIST
func (e *EP) AirspaceListGet(ctx echo.Context) error {
	asList := GetAirspaceList()
	return ctx.JSON(http.StatusOK, asList)
}

//AirspaceGet returns information from a particular airspace
// SELECT * FROM AIRSPACELIST WHERE NAME=NAME
func (e *EP) AirspaceGet(ctx echo.Context) error {
	aspace := GetAirspace(ctx.Param("name"))
	return ctx.JSON(http.StatusOK, aspace)
}

//UnitListGet returns data for all units
func (e *EP) UnitListGet(ctx echo.Context) error {
	uList := GetUnitList()
	return ctx.JSON(http.StatusOK, uList)
}

//UnitGet returns data for all units
func (e *EP) UnitGet(ctx echo.Context) error {
	unit := GetUnit(ctx.Param("name"), "KTIK")
	return ctx.JSON(http.StatusOK, unit)
}

//LOAsGet returns all of the ATCAgencies and their LOAs
func (e *EP) LOAsGet(ctx echo.Context) error {
	loas := GetLOAList()
	return ctx.JSON(http.StatusOK, loas)
}

//LessonsLearnedGet returns all of the lessons learned
func (e *EP) LessonsLearnedGet(ctx echo.Context) error {
	lessons := GetLessonsLearned()
	return ctx.JSON(http.StatusOK, lessons)
}

//AllTagsGet returns all existing database tags (LL)
func (e *EP) AllTagsGet(ctx echo.Context) error {
	tags := GetAllTags()
	return ctx.JSON(http.StatusOK, tags)
}

//UploadLOA uploads an LOA to the server (TODO - store meta in mongo, store file on GridFS?)
func (e *EP) UploadLOA(ctx echo.Context) error {
	file, err := ctx.FormFile("file")

	if err != nil {
		fmt.Println(err)
		return err
	}
	src, err := file.Open()
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer src.Close()

	dir := "./LOAs"
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.Mkdir(dir, os.ModeDir)
	}

	fName := file.Filename
	fmt.Println(fName)

	// TODO - regex whitelist of Filename pattern for .pdfs 

	dst, err := os.Create(dir + "/" + file.Filename)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		fmt.Println(err)
		return err
	}
	msg := "Uploaded " + file.Filename + " success."
	return ctx.JSON(http.StatusOK, msg)
}
