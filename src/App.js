import React, { useState, useEffect } from 'react';
import style from "./ImageChecker.module.css";
import defaultImage from "./default.png";


function App() {
  const [dots, setDots] = useState([]);
  const [coords, setCoords] = useState([]);
  const [imageRoot, setImageRoot] = useState("");
  const [mode, setMode] = useState("None"); // NONE, FIRST,SECOND , CHECK

  const [firstCoord, setFirstCoord] = useState(null); // FIRST 모드의 클릭 좌표
  const [secondCoord, setSecondCoord] = useState(null); // SECOND 모드의 클릭 좌표
  const [fileName, setFileName] = useState("cooooooords"); // 파일 이름 상태

  const getBoundaryBoxStyle = () => {
    const firstDot = dots.find((dot) => dot.mode === "FIRST");
    const secondDot = dots.find((dot) => dot.mode === "SECOND");

    if (!firstDot || !secondDot) return {};

    const x1 = Math.min(firstDot.x, secondDot.x);
    const y1 = Math.min(firstDot.y, secondDot.y);
    const x2 = Math.max(firstDot.x, secondDot.x);
    const y2 = Math.max(firstDot.y, secondDot.y);

    return {
      position: "absolute",
      left: `${x1}px`,
      top: `${y1}px`,
      width: `${x2 - x1}px`,
      height: `${y2 - y1}px`,
      border: "2px solid blue",
      zIndex: 3,
    };
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
        if (event.key === "1") {
            setMode("FIRST");
        } else if (event.key === "2") {
            setMode("SECOND");
        } else if (event.key ==="Escape"){
            setMode("None");
            setFirstCoord(null);
            setSecondCoord(null);
            setDots([]);
        } else if (event.key ==="Enter" || event.key === "3"){
            if( mode != "CHECK"){
                console.log(dots)
                const firstDot = dots.find((dot) => dot.mode === "FIRST");
                const secondDot = dots.find((dot) => dot.mode === "SECOND");
                if (!firstDot || !secondDot){
                } else{
                    const x1 = Math.floor(Math.min(firstDot.x, secondDot.x));
                    const y1 = Math.floor(Math.min(firstDot.y, secondDot.y));
                    const x2 = Math.ceil(Math.max(firstDot.x, secondDot.x));
                    const y2 = Math.ceil(Math.max(firstDot.y, secondDot.y));

                    setCoords((prev) =>{
                        if (!firstDot || !secondDot) return {};

                        return [...prev, [[x1, y1], [x2, y2]]]
                    })
                    setMode("None");
                    setFirstCoord(null);
                    setSecondCoord(null);
                    setDots([]);
                }
            }else{
                setMode("None");
                setDots([]);
            }

        }
    };

    // 키보드 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
    window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dots]); // 빈 배열을 사용해 컴포넌트 초기 마운트/언마운트 시만 실행


  const setImage1 = () => {
    // 이미지가 있으면 있는거보내고 없으면 default반환
    if(imageRoot == ""){
        return defaultImage
    }else{
        return imageRoot 
    }
  }

  const setImage2 = () => {
    // 이미지가 있으면 있는거보내고 없으면 default반환
    if(imageRoot == ""){
        return
    }else{
        return imageRoot
    }
  }

  const changeImage = () => {
    // 동적으로 파일 입력 요소 생성
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*"; // 이미지 파일만 허용
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setImageRoot(imageUrl);
      }
    };

    // 파일 선택기 열기
    fileInput.click();
  };

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode !== "None") {
        if (mode !== "CHECK"){
            setDots((prevDots) => {
                // 현재 모드와 동일한 점을 제거하고 새 좌표 추가
                const updatedDots = prevDots.filter((dot) => dot.mode !== mode);
                return [...updatedDots, { mode, x, y }];
            });
        }
    }
  };

  const handleDelete = (index) => {
    setCoords((prevCoords) => prevCoords.filter((_, i) => i !== index));
  };

  const handleCheck = (index) =>{
    const targetCoord = coords.filter((_, i) => i === index)[0]; // index번째 요소만 추출
    const x1 = targetCoord[0][0];
    const y1 = targetCoord[0][1];
    const x2 = targetCoord[1][0];
    const y2 = targetCoord[1][1];
    setDots([
      {
          mode: "FIRST",
          x : x1,
          y : y1,
      },
      {
          mode: "SECOND",
          x : x2,
          y : y2,
      }
    ])
  }

  const handleExport = () => {
    if (coords.length === 0) {
        alert("No data to export!");
        return;
    }

    // coords 데이터를 텍스트 형태로 변환
    const textData = coords
        .map((coord, index) => 
        `${index + 1}. [${coord[0][0]},${coord[0][1]}] [${coord[1][0]},${coord[1][1]}]`
        )
        .join("\n");

    // 텍스트 파일 생성
    const blob = new Blob([textData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // 가상의 링크 생성 및 다운로드 트리거
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();

    // 메모리 해제
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("Export Completed")
    setMode("NONE")
    setFirstCoord(null);
    setSecondCoord(null);
    setDots([]);
    setCoords([]);
    setImageRoot("");
  };

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  return (
    <div className={style["image-checker-container"]}>
        <div className={style["mode-container"]}>
            {mode}
        </div>
        <div className={style["main-frame"]}>
            <div className={style["meta-data-container"]}>
                <div className={style["data-wrapper"]}>
                    {coords.map((coord, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span>
                            {index + 1}: [{coord[0][0]},{coord[0][1]}] [{coord[1][0]},{coord[1][1]}]
                        </span>
                        <button
                            className={style["data-button"]}
                            onClick={() => handleDelete(index)}
                        >
                            X
                        </button>
                        <button
                            className={style["data-button"]}
                            onClick={() => handleCheck(index)}
                        >
                            C
                        </button>
                        </div>
                    ))}
                </div>
                <label>
                    File Name:
                    <input
                    type="text"
                    value={fileName}
                    onChange={handleFileNameChange}
                    style={{ marginLeft: "10px", padding: "5px" }}
                    />
                </label>
                <div
                 className={style["export-button"]}
                 onClick={handleExport}
                >
                    내보내기
                </div>
            </div>
            <div className={style["image-wrapper"]}>
                <img
                    src={setImage1()}
                    className={style["image-box"]}
                    onClick={changeImage}
                />
            </div>
            <div className={style["image-wrapper"]}>
                <div
                 className={style["clickable-area"]}
                 onClick={handleClick}
                 >
                    {dots.map((dot, index) => (
                        <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: dot.x,
                            top: dot.y,
                            width: "10px",
                            height: "10px",
                            backgroundColor: dot.mode === "FIRST" ? "black" : "red",
                        }}
                        />
                    ))}
                    {/* 경계 상자 렌더링 */}
                <div style={getBoundaryBoxStyle()}></div>
                </div>
                <img
                    src={setImage2()}
                className={style["image-box"]}/>
            </div>
        </div>
    </div>
  );
}

export default App