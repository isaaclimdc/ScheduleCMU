/* Layout of the overall data structures */

var allCourses =
[
  { Num : 15122
    Name : "Principles of Imperative Computation"
    Units : "10.0"
    Semester : 120
    Sections : [ { Num : "Lec 1"
                   Mini : undefined
                   Instructor : "Platzer"
                   Classes : [ { Day : "T"
                                 Start : "01:30PM"
                                 End : "02:50PM"
                                 Loc : "GHC 4102" },
                               { Day : "R"
                                 Start : "01:30PM"
                                 End : "02:50PM"
                                 Loc : "GHC 4102" } ]
                   Subsections : [ { Num : "A"
                                     Mini : undefined
                                     Instructor : "Bharadwaj"
                                     Classes : [ { Day : "W"
                                                   Start : "01:30PM"
                                                   End : "02:20PM"
                                                   Loc : "GHC 5304" },
                                                 { Day : "F"
                                                   Start : "01:30PM"
                                                   End : "02:20PM"
                                                   Loc : "GHC 5304" } ]
                                     Subsections : undefined },
                                   { Num : "B"
                                     Mini : undefined
                                     Instructor : "Chopra"
                                     Classes : [ { Day : "W"
                                                   Start : "02:30PM"
                                                   End : "03:20PM"
                                                   Loc : "GHC 5305" },
                                                 { Day : "F"
                                                   Start : "02:30PM"
                                                   End : "03:20PM"
                                                   Loc : "GHC 5305" } ]
                                     Subsections : undefined } ] },
                 { Num : "Lec 2"
                   Mini : undefined
                   Instructor : "Gunawardena"
                   Classes : [ { Day : "T"
                                 Start : "03:30PM"
                                 End : "04:50PM"
                                 Loc : "GHC 4102" },
                               { Day : "R"
                                 Start : "03:30PM"
                                 End : "04:50PM"
                                 Loc : "GHC 4102" } ]
                   Subsections : [ { Num : "C"
                                     Mini : undefined
                                     Instructor : "Horowitz"
                                     Classes : [ { Day : "W"
                                                   Start : "01:30PM"
                                                   End : "02:50PM"
                                                   Loc : "GHC 5306" },
                                                 { Day : "F"
                                                   Start : "01:30PM"
                                                   End : "02:50PM"
                                                   Loc : "GHC 5306" } ]
                                     Subsections : undefined },
                                   { Num : "D"
                                     Mini : undefined
                                     Instructor : "Lim"
                                     Classes : [ { Day : "W"
                                                   Start : "02:30PM"
                                                   End : "03:50PM"
                                                   Loc : "GHC 5307" },
                                                 { Day : "F"
                                                   Start : "02:30PM"
                                                   End : "03:50PM"
                                                   Loc : "GHC 5307" } ]
                                     Subsections : undefined } ] } ] }
]


Course {
    Num,
    Name,
    Units,
    Semester,
    Sections[]
}

Section {
    Num,
    Mini,
    Instructor,
    Classes[],
    Subsections[]
}

Class {
    Day,
    Start,
    End,
    Loc
}