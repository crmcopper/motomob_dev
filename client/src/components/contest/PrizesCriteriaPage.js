import React from "react"
import ReactHtmlParser from "react-html-parser"

function PrizesCriteriaPage({ contestId, page, contestData }) {
	// console.log("contestData", contestData);
	const templatePrize = contestData.prize_description
	const templateCriteria = contestData.criteria_description
	const templateSponsor = contestData.sponsor_description
	return (
		<>
			{page === "Prizes" &&
				<div className="quill photo-content">
					<div className="ql-container ql-snow ql-disabled">
						<div className="ql-editor">{ReactHtmlParser(templatePrize)}</div>
					</div>
				</div>
			}
			{page === "Criteria" &&
				<div className="quill photo-content">
					<div className="ql-container ql-snow ql-disabled">
						<div className="ql-editor">{ReactHtmlParser(templateCriteria)}</div>
					</div>
				</div>
			}
			{page === "Sponsors" &&
				<div className="quill photo-content">
					<div className="ql-container ql-snow ql-disabled">
						<div className="ql-editor">{ReactHtmlParser(templateSponsor)}</div>
					</div>
				</div>
		}
		</>
	)
}

export default PrizesCriteriaPage
