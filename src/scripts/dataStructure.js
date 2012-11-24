/* Layout of the overall data structures */

var allCourses =
[
  { Num : "15-122"
    Name : "Principles of Imperative Computation"
    Units : "10.0"
    Semester : 120
    Sections : [ { Num : "Lec 1"
                   Mini : undefined
                   Instructor : "Platzer"
                   Classes : [ { Day : "T"
                                 Start : "1:30p"
                                 End : "2:50p"
                                 Loc : "GHC 4102" },
                               { Day : "R"
                                 Start : "1:30p"
                                 End : "2:50p"
                                 Loc : "GHC 4102" } ]
                   Subsections : [ { Num : "A"
                                     Mini : undefined
                                     Instructor : "Bharadwaj"
                                     Classes : [ { Day : "W"
                                                   Start : "1:30p"
                                                   End : "2:20p"
                                                   Loc : "GHC 5304" },
                                                 { Day : "F"
                                                   Start : "1:30p"
                                                   End : "2:20p"
                                                   Loc : "GHC 5304" } ]
                                     Subsections : undefined },
                                   { Num : "B"
                                     Mini : undefined
                                     Instructor : "Chopra"
                                     Classes : [ { Day : "W"
                                                   Start : "2:30p"
                                                   End : "3:20p"
                                                   Loc : "GHC 5305" },
                                                 { Day : "F"
                                                   Start : "2:30p"
                                                   End : "3:20p"
                                                   Loc : "GHC 5305" } ]
                                     Subsections : undefined } ] },
                 { Num : "Lec 2"
                   Mini : undefined
                   Instructor : "Gunawardena"
                   Classes : [ { Day : "T"
                                 Start : "3:30p"
                                 End : "4:50p"
                                 Loc : "GHC 4102" },
                               { Day : "R"
                                 Start : "3:30p"
                                 End : "4:50p"
                                 Loc : "GHC 4102" } ]
                   Subsections : [ { Num : "C"
                                     Mini : undefined
                                     Instructor : "Horowitz"
                                     Classes : [ { Day : "W"
                                                   Start : "1:30p"
                                                   End : "2:50p"
                                                   Loc : "GHC 5306" },
                                                 { Day : "F"
                                                   Start : "1:30p"
                                                   End : "2:50p"
                                                   Loc : "GHC 5306" } ]
                                     Subsections : undefined },
                                   { Num : "D"
                                     Mini : undefined
                                     Instructor : "Lim"
                                     Classes : [ { Day : "W"
                                                   Start : "2:30p"
                                                   End : "3:50p"
                                                   Loc : "GHC 5307" },
                                                 { Day : "F"
                                                   Start : "2:30p"
                                                   End : "3:50p"
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